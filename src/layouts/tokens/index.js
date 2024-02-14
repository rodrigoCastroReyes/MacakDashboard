/**
=========================================================
* Material Dashboard 2 React - v2.2.0
=========================================================

* Product Page: https://www.creative-tim.com/product/material-dashboard-react
* Copyright 2023 Creative Tim (https://www.creative-tim.com)

Coded by www.creative-tim.com

 =========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
*/

import TokensHistory from "layouts/tokens/TokensHistory";

// @mui material components
{/*import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Grid from "@mui/material/Grid";

Material Dashboard 2 React components
import MDBox from "components/MDBox";
import TokenDetailHistory from "layouts/tokens/data/TokenDetailHistory";
import TokensHistory from "layouts/tokens/data/TokensHistory";

 Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

Data
import projectsTableData from "layouts/tokens/data/projectsTableData";

function Tokens() {
  const { columns: pColumns, rows: pRows } = projectsTableData();

  return (
      <DashboardLayout>
        <DashboardNavbar />
        <Router>
        <MDBox pt={6} pb={3}>
          <Grid container spacing={6}>
            <Grid item xs={12}>
              <Routes>
                
                <Route path="/tokens" element={<TokensHistory />} />
                
                <Route
                  exact
                  path="/tokens/:code"
                  element={<TokenDetailHistory />}
                />
              </Routes>
              <Grid item xs={12}>
            <Card>
              <MDBox
                mx={2}
                mt={-3}
                py={3}
                px={2}
                variant="gradient"
                bgColor="info"
                borderRadius="lg"
                coloredShadow="info"
              >
                <MDTypography variant="h6" color="white">
                  Projects Table
                </MDTypography>
              </MDBox>
              <MDBox pt={3}>
                <DataTable
                  table={{ columns: pColumns, rows: pRows }}
                  isSorted={false}
                  entriesPerPage={false}
                  showTotalEntries={false}
                  noEndBorder
                />
              </MDBox>
            </Card>
  </Grid>
            </Grid>
          </Grid>
        </MDBox>
        </Router>
        <Footer />
      </DashboardLayout>
  );
}

export default Tokens;
*/}



/**
=========================================================
* Material Dashboard 2 React - v2.2.0
=========================================================

* Product Page: https://www.creative-tim.com/product/material-dashboard-react
* Copyright 2023 Creative Tim (https://www.creative-tim.com)

Coded by www.creative-tim.com

 =========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
*/

function Tokens() {

  return (
      <TokensHistory />
  );
}

export default Tokens;