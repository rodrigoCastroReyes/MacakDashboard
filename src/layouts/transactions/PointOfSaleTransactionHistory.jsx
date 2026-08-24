import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import moment from "moment";
import "moment/dist/locale/es";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import { Autocomplete, TextField, InputAdornment } from "@mui/material";
import StorefrontIcon from "@mui/icons-material/Storefront";
import MDTypography from "components/MDTypography";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import Icon from "@mui/material/Icon";
import MDButton from "components/MDButton";
import StateMessage from "examples/StateMessage";
import SectionHeader from "examples/SectionHeader";
import MDBox from "components/MDBox";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import useAxios from "hooks/useAxios";
import { toPng } from "html-to-image";
import jsPDF from "jspdf";
import "./styles.css";
import SalesPerProduct from "layouts/reports/components/SalesPerProduct";
import QuantitySoldByProduct from "layouts/reports/components/QuantitySoldByProduct";
import SalesPerHour from "layouts/reports/components/SalesPerHour";
import UnitsPerHourAndProduct from "layouts/reports/components/UnitsPerHourAndProduct";
import SalesByHourAndProductHeatmap from "layouts/reports/components/SalesByHourAndProductHeatmap";
import StoreHero from "layouts/reports/components/StoreHero";
import { API_BASE_URL } from '../../config';


function PointOfSaleTransactionHistory() {
  moment.locale('es');
  const { id } = useParams();
  const navigate = useNavigate();
  const eventId = localStorage.getItem("eventId");

  const [refreshToken, setRefreshToken] = useState(0);

  const { data, loading, error, refetch } = useAxios(
    `${API_BASE_URL}/dashboard/store?store_id=${id}`
  );

  const { data: stores, refetch: refetchStores } = useAxios(
    `${API_BASE_URL}/store/by_event?id=${eventId}`
  );

  // Fuerza el refetch de esta vista y de todos los hijos, saltándose la caché.
  const handleReload = () => {
    refetch();
    refetchStores();
    setRefreshToken((n) => n + 1);
  };


  const handlePrint = async () => {
    // Esperar a que las fuentes web (Poppins) estén listas antes de rasterizar,
    // para que se embeban con las métricas correctas.
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
      "section-units-hour",
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

    // Opciones de html-to-image. Renderiza con foreignObject nativo del
    // navegador, así que los espacios entre palabras se respetan y ya NO
    // hace falta el hack de letter-spacing/word-spacing de html2canvas.
    // pixelRatio: 2 equivale al antiguo scale: 2.
    const imgOptions = {
      pixelRatio: 2,
      backgroundColor: "#ffffff",
      cacheBust: true,
    };

    // Captura un nodo a PNG y devuelve el dataURL + sus dimensiones reales en px,
    // que necesitamos para calcular la altura al pasar a mm en el PDF.
    const capture = async (el) => {
      const dataUrl = await toPng(el, imgOptions);
      const img = new Image();
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = dataUrl;
      });
      return { dataUrl, width: img.naturalWidth, height: img.naturalHeight };
    };

    // Warm-up: la primera captura de html-to-image a veces sale en blanco
    // porque todavía está embebiendo fuentes/estilos/imágenes. Descartamos
    // un render inicial para que las capturas reales salgan completas.
    const firstEl = document.getElementById(sections[0]);
    if (firstEl) {
      try {
        await toPng(firstEl, imgOptions);
      } catch (e) {
        // ignorar: es solo para precargar recursos
      }
    }

    let currentY = addHeader(true, data?.store?.name || '');

    for (let i = 0; i < sections.length; i++) {
      const el = document.getElementById(sections[i]);
      if (!el) continue;

      const { dataUrl, width, height } = await capture(el);

      const imgHeight = (height * contentW) / width;
      const availableH = pdfHeight - currentY - FOOTER_H;

      if (imgHeight > availableH && currentY > HEADER_H1) {
        // No cabe en la página actual — nueva página
        pdf.addPage();
        currentY = addHeader(false, data?.store?.name || '');
      }

      // Si la sección es más alta que una página entera, paginar
      let sectionShown = 0;
      let remainingH = imgHeight;

      while (remainingH > 0) {
        const availH = pdfHeight - currentY - FOOTER_H;
        pdf.addImage(dataUrl, "PNG", MARGIN, currentY - sectionShown, contentW, imgHeight);

        if (remainingH <= availH) {
          currentY += remainingH;
          remainingH = 0;
        } else {
          sectionShown += availH;
          remainingH -= availH;
          pdf.addPage();
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

  // Solo se ocupa la pantalla entera en la PRIMERA carga. Al pulsar "Actualizar"
  // ya hay datos: si aquí se devolviera el mensaje, los hijos se desmontarían,
  // volverían a montarse y leerían de la caché en lugar de refrescarse (además
  // de hacer desaparecer el contenido en cada refresco).
  if (!data?.store) {
    return (
      <DashboardLayout>
        <DashboardNavbar main_title="Historial de ventas" />
        <StateMessage
          state={loading ? "loading" : "error"}
          message={loading ? "Cargando ventas de la tienda…" : undefined}
        />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <DashboardNavbar
        main_title={data?.store?.name ? `Historial de ventas · ${data.store.name}` : "Historial de ventas"}
        onPrint={handlePrint}
      />

      <MDBox py={3}>
        {/* Cabecera en una sola fila: volver, selector y recargar.
            Antes eran un rótulo de sección + un bloque aparte con el selector,
            y se comían casi 120px de alto. Queda fuera del PDF a propósito. */}
        <MDBox
          display="flex"
          alignItems="center"
          gap={1.5}
          flexWrap="wrap"
          mb={3}
        >
          <Tooltip title="Volver a Tiendas">
            <IconButton
              size="small"
              onClick={() => navigate("/tiendas")}
              sx={{ color: "text.main", "&:hover": { color: "info.main" } }}
            >
              <Icon>arrow_back</Icon>
            </IconButton>
          </Tooltip>

          <Autocomplete
            options={stores || []}
            getOptionLabel={(store) => store.name || ""}
            value={stores?.find((s) => s._id === id) || null}
            onChange={handleStoreChange}
            sx={{ width: { xs: "100%", sm: 320 } }}
            renderInput={(params) => (
              <TextField
                {...params}
                size="small"
                placeholder="Cambiar de tienda…"
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

          <MDBox ml="auto">
            <MDButton
              variant="outlined"
              color="info"
              size="small"
              onClick={handleReload}
              startIcon={<Icon>refresh</Icon>}
            >
              Actualizar
            </MDButton>
          </MDBox>
        </MDBox>

        {/* Contenido del PDF */}
        <div>
          <div id="section-hero">
            <SectionHeader title="Resumen de la tienda" />
            {/* Sin <Card> aquí: StoreHero ya pinta sus propias tarjetas de métrica. */}
            <StoreHero id_store={id} refreshToken={refreshToken} />
          </div>

          <div id="section-products">
            <SectionHeader title="Ventas por producto" mt={4} />
            <Grid container spacing={2} alignItems="stretch">
              <Grid size={{ xs: 12, md: 6 }}>
                <Card sx={{ height: "100%" }}>
                  <SalesPerProduct id_store={id} refreshToken={refreshToken} />
                </Card>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Card sx={{ height: "100%" }}>
                  <QuantitySoldByProduct id_store={id} refreshToken={refreshToken} />
                </Card>
              </Grid>
            </Grid>
          </div>

          <div id="section-sales-hour">
            <SectionHeader title="Ventas por hora" mt={4} />
            <Card>
              <SalesPerHour id_store={id} refreshToken={refreshToken} />
            </Card>
          </div>

          <div id="section-units-hour">
            <SectionHeader title="Unidades por hora" mt={4} />
            <Card>
              <UnitsPerHourAndProduct id_store={id} refreshToken={refreshToken} />
            </Card>
          </div>

          <div id="section-sales-hour-product">
            <SectionHeader title="Productos vendidos por hora" mt={4} />
            <Card>
              <SalesByHourAndProductHeatmap id_store={id} refreshToken={refreshToken} />
            </Card>
          </div>
        </div>
      </MDBox>
    </DashboardLayout>
  );
}

export default PointOfSaleTransactionHistory;