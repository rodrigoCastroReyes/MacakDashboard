import PropTypes from "prop-types";

import MDBox from "components/MDBox";
import PageLayout from "examples/LayoutContainers/PageLayout";

/**
 * Fondo de las pantallas de autenticación: claro y neutro, con dos halos muy suaves
 * en los colores del logo (azul y cyan/lima) en lugar de una fotografía.
 */
function BasicLayout({ children }) {
  return (
    <PageLayout>
      <MDBox
        position="fixed"
        top={0}
        left={0}
        width="100%"
        height="100%"
        sx={{
          // Halos con radial-gradient en vez de círculos con `filter: blur()`:
          // mismo resultado visual y sin el coste de rasterizado del desenfoque.
          background: `
            radial-gradient(38rem 30rem at 100% 0%, rgba(14, 227, 225, 0.20) 0%, rgba(188, 252, 58, 0.10) 45%, rgba(244, 246, 251, 0) 70%),
            radial-gradient(34rem 28rem at 0% 100%, rgba(0, 83, 209, 0.16) 0%, rgba(14, 227, 225, 0.08) 45%, rgba(244, 246, 251, 0) 70%),
            #f4f6fb
          `,
        }}
      />
      <MDBox
        position="relative"
        minHeight="100vh"
        display="flex"
        alignItems="center"
        justifyContent="center"
        px={2}
        py={4}
      >
        <MDBox width="100%" maxWidth="26rem">
          {children}
        </MDBox>
      </MDBox>
    </PageLayout>
  );
}

BasicLayout.propTypes = {
  children: PropTypes.node,
};

export default BasicLayout;
