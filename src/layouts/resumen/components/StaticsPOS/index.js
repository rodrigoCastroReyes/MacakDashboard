import React from "react";
import PropTypes from "prop-types";
import {
  Box,
  Typography,
  Avatar,
  Button,
  Card,
  CardContent,
} from "@mui/material";
import StoreIcon from "@mui/icons-material/Store";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDProgress from "components/MDProgress";

const PosStatistics = ({ statistics }) => {
  const topThreeStats = statistics.slice(0, 3);

  const Progress = ({ color, value }) => (
    <MDBox display="flex" alignItems="center">
      <MDBox ml={0.5} width="9rem">
        <MDProgress variant="gradient" color={color} value={value} />
      </MDBox>
      <MDTypography variant="caption" color="text" fontWeight="medium">
        {value}%
      </MDTypography>
    </MDBox>
  );

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Estadísticas por punto de venta
        </Typography>
        {topThreeStats.map(({ pos, percentage }) => (
          <div key={pos}>
            <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
              <Avatar>
                <StoreIcon />
              </Avatar>
              <Box ml={2}>
                <Progress color="primary" value={percentage} />
                <Typography variant="subtitle1">{pos}</Typography>
              </Box>
            </Box>
          </div>
        ))}
        <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
          <Button variant="contained" style={{color:"white"}}>Ver reporte</Button>
        </Box>
      </CardContent>
    </Card>
  );
};

PosStatistics.propTypes = {
  statistics: PropTypes.arrayOf(
    PropTypes.shape({
      pos: PropTypes.string.isRequired,
      percentage: PropTypes.number.isRequired,
    })
  ).isRequired,
};

export default PosStatistics;
