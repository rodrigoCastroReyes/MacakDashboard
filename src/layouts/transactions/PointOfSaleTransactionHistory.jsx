import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import moment from "moment";
import "moment/dist/locale/es";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
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
import OrdersList from "layouts/reports/components/OrdersList";
import SalesByVendor from "layouts/reports/components/SalesByVendor";
import { downloadCsv } from "utils/csv";
import { API_BASE_URL } from '../../config';


function PointOfSaleTransactionHistory() {
  moment.locale('es');
  const { id } = useParams();
  const navigate = useNavigate();
  const eventId = localStorage.getItem("eventId");

  const [refreshToken, setRefreshToken] = useState(0);
  const [activeTab, setActiveTab] = useState(0); // 0: Resumen de ventas · 1: Órdenes
  const [exportingCsv, setExportingCsv] = useState(false);
  // Vista del resumen: "store" (toda la tienda) o "vendors" (por vendedor).
  // El PDF y el CSV exportan la vista elegida.
  const [summaryView, setSummaryView] = useState("store");

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

    // IDs de las secciones a capturar en orden. En la vista por vendedor hay
    // una sección por vendedor, así que se leen del DOM.
    const sections = summaryView === "vendors"
      ? [
          "section-vendors-summary",
          ...[...document.querySelectorAll('[id^="section-vendor-"]')].map((el) => el.id),
        ]
      : [
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

  // CSV de ventas por producto: cantidad total vendida y monto total de cada
  // producto. Une los mismos dos endpoints de los gráficos de "Ventas por
  // producto" (mismas órdenes: exitosas y no anuladas), pedidos en el momento
  // para no exportar datos de la caché.
  const handleExportCsv = async () => {
    if (summaryView === "vendors") {
      handleExportVendorsCsv();
      return;
    }
    setExportingCsv(true);
    try {
      const [qtyRes, valueRes] = await Promise.all([
        fetch(`${API_BASE_URL}/dashboard/sold_products?store_id=${id}`),
        fetch(`${API_BASE_URL}/dashboard/total_per_product?store_id=${id}`),
      ]);
      if (!qtyRes.ok || !valueRes.ok) throw new Error("No se pudieron obtener las ventas");
      const quantities = (await qtyRes.json())?.report || [];
      const values = (await valueRes.json())?.report || [];

      const byProduct = new Map();
      const entry = (productId, description) => {
        if (!byProduct.has(productId)) {
          byProduct.set(productId, { description: null, quantity: 0, value: 0 });
        }
        const item = byProduct.get(productId);
        if (!item.description && description) item.description = description;
        return item;
      };
      quantities.forEach((p) => { entry(p.product_id, p.description).quantity += Number(p.quantity) || 0; });
      values.forEach((p) => { entry(p.product_id, p.description).value += Number(p.value) || 0; });

      const items = [...byProduct.values()].sort((a, b) => b.value - a.value);
      const money = (n) => (Math.round(n * 100) / 100).toFixed(2);
      const rows = items.map((p) => [
        // Un producto borrado después de vender sigue contando en el dinero.
        p.description || "Producto eliminado",
        p.quantity,
        money(p.value),
      ]);
      rows.push([
        "TOTAL",
        items.reduce((acc, p) => acc + p.quantity, 0),
        money(items.reduce((acc, p) => acc + p.value, 0)),
      ]);

      const store = (data?.store?.name || "tienda").replace(/[\\/:*?"<>|]/g, "_");
      downloadCsv(
        `Ventas_por_producto_${store}_${moment().format("YYYYMMDD_HHmmss")}.csv`,
        ["Producto", "Items vendidos", "Ventas totales"],
        rows
      );
    } catch (e) {
      console.error("Error al exportar CSV:", e);
      alert("No se pudo generar el CSV de ventas por producto.");
    } finally {
      setExportingCsv(false);
    }
  };

  // CSV por vendedor: cada vendedor con sus productos, su subtotal y, al final,
  // el total de la tienda. Pedido en el momento, igual que el CSV por producto.
  const handleExportVendorsCsv = async () => {
    setExportingCsv(true);
    try {
      const res = await fetch(`${API_BASE_URL}/dashboard/sales_by_vendor?store_id=${id}`);
      if (!res.ok) throw new Error("No se pudieron obtener las ventas por vendedor");
      const report = await res.json();

      const money = (n) => (Math.round(n * 100) / 100).toFixed(2);
      const rows = [];
      (report.vendors || []).forEach((vendor) => {
        const name = vendor.username || "Vendedor sin nombre";
        vendor.products.forEach((p) => {
          rows.push([name, p.description || "Producto eliminado", p.quantity, money(p.value)]);
        });
        rows.push([name, `SUBTOTAL ${name} (${vendor.orders} órdenes)`, vendor.items, money(vendor.total)]);
      });
      rows.push(["TOTAL TIENDA", `${report.orders || 0} órdenes`, report.items || 0, money(report.total || 0)]);

      const store = (data?.store?.name || "tienda").replace(/[\\/:*?"<>|]/g, "_");
      downloadCsv(
        `Ventas_por_vendedor_${store}_${moment().format("YYYYMMDD_HHmmss")}.csv`,
        ["Vendedor", "Producto", "Items vendidos", "Ventas totales"],
        rows
      );
    } catch (e) {
      console.error("Error al exportar CSV:", e);
      alert("No se pudo generar el CSV de ventas por vendedor.");
    } finally {
      setExportingCsv(false);
    }
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
      {/* Imprimir a PDF solo tiene sentido en el resumen: captura sus secciones por id. */}
      <DashboardNavbar
        main_title={data?.store?.name ? `Historial de ventas · ${data.store.name}` : "Historial de ventas"}
        onPrint={activeTab === 0 ? handlePrint : undefined}
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

          <MDBox ml="auto" display="flex" gap={1}>
            {activeTab === 0 && (
              <Tooltip
                title={
                  summaryView === "vendors"
                    ? "Productos, cantidad y monto vendido por cada vendedor"
                    : "Cantidad y monto total vendido de cada producto"
                }
              >
                <span>
                  <MDButton
                    variant="outlined"
                    color="info"
                    size="small"
                    onClick={handleExportCsv}
                    disabled={exportingCsv}
                    startIcon={<Icon>download</Icon>}
                  >
                    {exportingCsv ? "Generando…" : "CSV"}
                  </MDButton>
                </span>
              </Tooltip>
            )}
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

        <MDBox display="flex" alignItems="center" gap={2} flexWrap="wrap" mb={3}>
          <Tabs
            value={activeTab}
            onChange={(_, v) => setActiveTab(v)}
            sx={{ width: 360, maxWidth: "100%" }}
          >
            <Tab label="Resumen de ventas" />
            <Tab label="Órdenes" />
          </Tabs>

          {/* Mismo control que las pestañas de la izquierda, alineado a la derecha. */}
          {activeTab === 0 && (
            <Tabs
              value={summaryView}
              onChange={(_, v) => setSummaryView(v)}
              aria-label="Vista del resumen"
              sx={{ width: 320, maxWidth: "100%", ml: "auto" }}
            >
              <Tab value="store" label="Toda la tienda" />
              <Tab value="vendors" label="Por vendedor" />
            </Tabs>
          )}
        </MDBox>

        {/* El resumen se mantiene montado y solo se oculta con CSS: así sus hijos
            no se vuelven a pedir al cambiar de pestaña y el PDF sigue capturando
            sus secciones por id. Las Órdenes se montan bajo demanda. */}
        <MDBox sx={{ display: activeTab === 0 && summaryView === "store" ? "block" : "none" }}>
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

        {/* Se monta al elegir la vista: solo entonces se pide el endpoint. */}
        {activeTab === 0 && summaryView === "vendors" && (
          <SalesByVendor id_store={id} refreshToken={refreshToken} />
        )}

        {activeTab === 1 && (
          <OrdersList id_store={id} refreshToken={refreshToken} />
        )}
      </MDBox>
    </DashboardLayout>
  );
}

export default PointOfSaleTransactionHistory;