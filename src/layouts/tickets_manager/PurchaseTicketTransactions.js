import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import moment from "moment";
import MDTypography from "components/MDTypography";
import { Card, CardContent } from '@mui/material';
import DataTable from "examples/Tables/DataTable";
import useAxios from "hooks/useAxios";
import { Link } from 'react-router-dom';
import { styled } from "@mui/system";
import DownloadIcon from '@mui/icons-material/Download';
import axios from 'axios';

// Variable Global
import { API_BASE_URL } from '../../config';


const RefreshButtonContainer = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start",
  marginRight: theme.spacing(3), // Agrega margen inferior para separar del campo de búsqueda
  marginTop: theme.spacing(2), // Agrega margen inferior para separar del campo de búsqueda
  marginBottom: theme.spacing(2), // Agrega margen inferior para separar del campo de búsqueda
  [theme.breakpoints.up("sm")]: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
}));

const PurchaseTicketsTransactions = ({ id_event }) => {
  const [transactions, setTransactions] = useState([]);
  const [attenders, setAttenders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [transRes, attendersRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/purchase_ticket/event?id=${id_event}`),
          axios.get(`${API_BASE_URL}/purchase_ticket/attender_event?id=${id_event}`)
        ]);

        setTransactions(transRes.data);
        setAttenders(attendersRes.data);
        console.log("Asistentes:", attendersRes.data);
        console.log("Transacciones:", transRes.data);
        setLoading(false);
      } catch (err) {
        console.error("Error al obtener datos:", err);
        setError(true);
        setLoading(false);
      }
    };

    fetchData();
  }, [id_event]);

  const columns = [
    { Header: "Fecha", accessor: "date", align: "center" },
    { Header: "Asistente", accessor: "assistant", align: "center" },
    { Header: "Monto", accessor: "amount", align: "center" },
    { Header: "Precarga", accessor: "precharge", align: "center" },
  ];

  if (loading) return <div>Cargando...</div>;
  if (error) return <div pt="2" pb="2" display="flex" justifyContent="center">Sin datos disponibles</div>;

  const getFullName = (id) => {
    const attender = attenders.find((a) => a._id === id);
    return attender ? attender.full_name : id; // fallback al ID del usuraio si no se encuentra
  };

  const rows = transactions.map((transaction) => ({
    date: (
      <MDTypography variant="caption" fontWeight="medium" style={{ color: 'inherit' }}>
        {moment(transaction.purchase_ticket.__createdtime__).format("DD MMM YYYY HH:mm")}
      </MDTypography>
    ),
    assistant: (
      <MDTypography variant="button" fontWeight="medium" style={{ color: 'inherit' }}>
        {getFullName(transaction.purchase_ticket.attender_id)}
      </MDTypography>
    ),
    amount: (
      <MDTypography variant="button" fontWeight="medium" style={{ color: 'inherit' }}>
        <Link className="custom-link" to={`${API_BASE_URL}/orden_boleteria/${transaction._id}`}>
          {"$"}
          {transaction.purchase_ticket.total_amount}{" "}
        </Link>       
      </MDTypography>
    ),
    precharge: (
      <MDTypography variant="button" fontWeight="medium" style={{ color: 'inherit' }}>
        {transaction.purchase_ticket.precharge_amount}
      </MDTypography>
    ),
  }));
  return (
    <Card>
      <CardContent>
        <RefreshButtonContainer>
          <MDTypography colorVerticalBarChart="dark" fontWeight="bold" fontFamily="montserrat-semibold" component="div" align="left" style={{ fontSize: "1rem" }} >
            Historial de ordenes
          </MDTypography>
          <Link className='custom-btn-icon custom-link' to={`${API_BASE_URL}/report/generate_report_of_ticket_manager?event_id=${id_event}`} target="_blank" download title="Descargar Informe de Historial de ordenes">
            <DownloadIcon style={{ margin: "0px 10px", cursor:"pointer"}} fontSize="medium" />
          </Link>
        </RefreshButtonContainer>
        <DataTable
          table={{ columns, rows }}
          isSorted={false}
          entriesPerPage={false}
          showTotalEntries={false}
          noEndBorder
        />
      </CardContent>
    </Card>
  );
};

PurchaseTicketsTransactions.propTypes = {
  id_event: PropTypes.string.isRequired,
};

export default PurchaseTicketsTransactions;
