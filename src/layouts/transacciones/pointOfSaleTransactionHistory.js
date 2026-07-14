import React, { useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import moment from "moment";
import 'moment/locale/es';
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import { Autocomplete, TextField, InputAdornment } from "@mui/material";
import StorefrontIcon from "@mui/icons-material/Storefront";
import MDTypography from "components/MDTypography";
import MDBox from "components/MDBox";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import useAxios from "hooks/useAxios";
import MDBadge from "components/MDBadge";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import "./styles.css";
import SalesPerProduct from "layouts/reportes/components/SalesPerProduct";
import QuantitySoldByProduct from "layouts/reportes/components/QuantitySoldByProduct";
import SalesPerHour from "layouts/reportes/components/SalesPerHour";
import SalesPerHourAndProduct from "layouts/reportes/components/SalesPerHourAndProduct";
import StoreHero from "layouts/reportes/components/StoreHero";
import { styled } from "@mui/system";
import { API_BASE_URL } from '../../config';


function PointOfSaleTransactionHistory() {
  moment.locale('es');
  const { id } = useParams();
  const navigate = useNavigate();
  const eventId = localStorage.getItem("eventId");
  const printRef = useRef();

  const { data, loading, error } = useAxios(
    `${API_BASE_URL}/dashboard/store?store_id=${id}`
  );

  const { data: stores } = useAxios(
    `${API_BASE_URL}/store/by_event?id=${eventId}`
  );


  const handlePrint = async () => {
    // Asegurar que las fuentes web (Poppins) estén cargadas antes de rasterizar.
    // Si no, html2canvas usa métricas de una fuente fallback y colapsa los espacios.
    if (document.fonts && document.fonts.ready) {
      try {
        await document.fonts.ready;
      } catch (e) {
        // continúa aunque falle
      }
    }

    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const MARGIN = 12;
    const HEADER_H1 = 26;
    const HEADER_HN = 16;
    const FOOTER_H = 10;
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const contentW = pdfWidth - MARGIN * 2;

    // IDs de las secciones a capturar en orden
    const sections = [
      "section-hero",
      "section-products",
      "section-sales-hour",
      "section-sales-hour-product",
    ];

    const addHeader = (isFirst, storeName) => {
      if (isFirst) {
        pdf.setFillColor(248, 249, 250);
        pdf.rect(0, 0, pdfWidth, HEADER_H1, "F");
        pdf.setFontSize(13);
        pdf.setFont("helvetica", "bold");
        pdf.setTextColor(30, 30, 30);
        pdf.text(`Reporte de ventas — ${storeName}`, pdfWidth / 2, 10, { align: "center" });
        pdf.setFontSize(9);
        pdf.setFont("helvetica", "normal");
        pdf.setTextColor(100, 100, 100);
        pdf.text(
          new Date().toLocaleDateString('es-EC', { year: 'numeric', month: 'long', day: 'numeric' }),
          pdfWidth / 2, 17, { align: "center" }
        );
        pdf.setDrawColor(200, 200, 200);
        pdf.line(MARGIN, HEADER_H1 - 2, pdfWidth - MARGIN, HEADER_H1 - 2);
        return HEADER_H1;
      } else {
        pdf.setFillColor(248, 249, 250);
        pdf.rect(0, 0, pdfWidth, HEADER_HN, "F");
        pdf.setFontSize(9);
        pdf.setFont("helvetica", "bold");
        pdf.setTextColor(30, 30, 30);
        pdf.text(`${storeName} — continuación`, MARGIN, 9);
        pdf.setDrawColor(200, 200, 200);
        pdf.line(MARGIN, HEADER_HN - 2, pdfWidth - MARGIN, HEADER_HN - 2);
        return HEADER_HN;
      }
    };

    // Opciones compartidas de html2canvas.
    // onclone neutraliza letter-spacing/word-spacing SOLO en la copia que
    // html2canvas rasteriza — evita que los espacios entre palabras se
    // colapsen ("Top 5 por ingresos" → "Top5poringresos"). No afecta la UI real.
    const h2cOptions = {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: "#ffffff",
      onclone: (clonedDoc) => {
        const style = clonedDoc.createElement("style");
        style.innerHTML = `
          * {
            letter-spacing: normal !important;
            word-spacing: normal !important;
          }
        `;
        clonedDoc.head.appendChild(style);
      },
    };

    let currentY = addHeader(true, data?.store?.name || '');
    let isFirstPage = true;

    for (let i = 0; i < sections.length; i++) {
      const el = document.getElementById(sections[i]);
      if (!el) continue;

      const canvas = await html2canvas(el, h2cOptions);

      const imgData = canvas.toDataURL("image/png");
      const imgHeight = (canvas.height * contentW) / canvas.width;
      const availableH = pdfHeight - currentY - FOOTER_H;

      if (imgHeight > availableH && currentY > HEADER_H1) {
        // No cabe en la página actual — nueva página
        pdf.addPage();
        isFirstPage = false;
        currentY = addHeader(false, data?.store?.name || '');
      }

      // Si la sección es más alta que una página entera, paginar
      let sectionShown = 0;
      let remainingH = imgHeight;

      while (remainingH > 0) {
        const availH = pdfHeight - currentY - FOOTER_H;
        pdf.addImage(imgData, "PNG", MARGIN, currentY - sectionShown, contentW, imgHeight);

        if (remainingH <= availH) {
          currentY += remainingH;
          remainingH = 0;
        } else {
          sectionShown += availH;
          remainingH -= availH;
          pdf.addPage();
          isFirstPage = false;
          currentY = addHeader(false, data?.store?.name || '');
        }
      }
    }

    // Pie de página
    pdf.setFontSize(8);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(150, 150, 150);
    pdf.text(
      `MACAK · Generado el ${new Date().toLocaleDateString('es-EC')}`,
      pdfWidth / 2, pdfHeight - 4, { align: "center" }
    );

    pdf.save(`Reporte_${data?.store?.name || 'tienda'}_${new Date().toLocaleDateString('es-EC')}.pdf`);
  };

  const handleStoreChange = (_, newStore) => {
    if (newStore) {
      localStorage.setItem("selectedStoreId", newStore._id);
      navigate(`/transaccion/${newStore._id}`);
    }
  };

  const sortTransactions = data?.transactions?.sort(
    (trans1, trans2) => trans2.__updatedtime__ - trans1.__updatedtime__
  );

  const getTranslateStatus = (transaction) => {
    if (transaction.status === "success") return "Exitosa";
    return "Rechazada";
  };

  const RefreshButtonContainer = styled("div")(({ theme }) => ({
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    marginRight: theme.spacing(3),
    [theme.breakpoints.up("sm")]: {
      flexDirection: "row",
      justifyContent: "center",
    },
  }));


  if (loading)
    return (
      <DashboardLayout>
        <DashboardNavbar main_title="Historial de ventas" />
        <div>Cargando.....</div>
      </DashboardLayout>
    );

  if (error || !data?.store || !data?.transactions)
    return (
      <DashboardLayout>
        <DashboardNavbar main_title="" />
        <MDBox pt={6} pb={3}>
          <MDTypography component="div" align="center" className="sale-transaction-title" color="white">
            Historial de {data?.store?.name}
          </MDTypography>
          <span>No hay transacciones</span>
        </MDBox>
      </DashboardLayout>
    );

  const rows = sortTransactions.map((transaction) => ({
    date: (
      <MDTypography
        variant="caption"
        color="text"
        fontFamily="poppins"
        fontSize="12px"
        fontWeight="medium"
        style={{ color: transaction.status === "rejected" ? "red" : "inherit" }}
      >
        {moment(transaction.__createdtime__).format("DD [de] MMM YYYY HH:mm A")}
      </MDTypography>
    ),
    status: (
      <MDBox ml={-1}>
        <MDBadge
          fontFamily="poppins"
          badgeContent={getTranslateStatus(transaction)}
          color={transaction.status === "order" ? "info" : "success"}
          variant="gradient"
          size="sm"
        />
      </MDBox>
    ),
    amount: (
      <MDTypography
        fontFamily="poppins"
        fontSize="12px"
        variant="caption"
        color="text"
        fontWeight="bold"
      >
        ${Math.abs(transaction.token_last_balance - transaction.token_new_balance)}
      </MDTypography>
    ),
  }));

  return (
    <DashboardLayout>
      <DashboardNavbar
        main_title={`Historial de ventas de ${data.store.name}`}
        onPrint={handlePrint}
      />

      {/* Selector de tienda — fuera del ref */}
      <MDBox mb={2}>
        <Autocomplete
          options={stores || []}
          getOptionLabel={(store) => store.name || ""}
          value={stores?.find((s) => s._id === id) || null}
          onChange={handleStoreChange}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Tienda"
              InputProps={{
                ...params.InputProps,
                startAdornment: (
                  <>
                    <InputAdornment position="start">
                      <StorefrontIcon fontSize="small" />
                    </InputAdornment>
                    {params.InputProps.startAdornment}
                  </>
                ),
              }}
            />
          )}
          isOptionEqualToValue={(option, value) => option._id === value._id}
          noOptionsText="No se encontraron tiendas"
        />
      </MDBox>

      {/* Contenido del PDF */}
      <div ref={printRef}>

      <div id="section-hero">
        <Card sx={{ mb: 2 }}>
          <StoreHero id_store={id} store_name={data.store.name} />
        </Card>
      </div>

      <div id="section-products">
        <MDBox pt={1} pb={2}>
          <Grid container spacing={2} alignItems="stretch">
            <Grid item xs={12} sm={6}>
              <Card sx={{ height: '100%' }}>
                <SalesPerProduct id_store={id} />
              </Card>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Card sx={{ height: '100%' }}>
                <QuantitySoldByProduct id_store={id} />
              </Card>
            </Grid>
          </Grid>
        </MDBox>
      </div>

      <div id="section-sales-hour">
        <MDBox pt={1} pb={2}>
          <Grid container>
            <Grid item xs={12}>
              <Card>
                <SalesPerHour id_store={id} />
              </Card>
            </Grid>
          </Grid>
        </MDBox>
      </div>

      <div id="section-sales-hour-product">
        <MDBox pt={1} pb={2}>
          <Grid container>
            <Grid item xs={12}>
              <Card>
                <SalesPerHourAndProduct id_store={id} />
              </Card>
            </Grid>
          </Grid>
        </MDBox>
      </div>

    </div>
    </DashboardLayout>
  );
}

export default PointOfSaleTransactionHistory;