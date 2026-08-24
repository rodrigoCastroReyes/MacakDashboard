import React, { useEffect, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import moment from "moment";
import MDTypography from "components/MDTypography";
import { Card, CardContent, IconButton } from '@mui/material';
import DataTable from "examples/Tables/DataTable";
import useAxios from "hooks/useAxios";
import { Link } from 'react-router-dom';
import { display, styled } from "@mui/system";
import DownloadIcon from '@mui/icons-material/Download';
import RefreshIcon from '@mui/icons-material/Refresh';
import axios from 'axios';

// Variable Global
import { API_BASE_URL } from '../../config';
import StateMessage from "examples/StateMessage";

const RefreshButtonContainer = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start",
  marginRight: theme.spacing(3),
  marginTop: theme.spacing(2),
  marginBottom: theme.spacing(2),
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
  const [refreshKey, setRefreshKey] = useState(0);

  // Mueve la lógica de la llamada a una función separada
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [transRes, attendersRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/purchase_ticket/event?id=${id_event}`),
        axios.get(`${API_BASE_URL}/purchase_ticket/attender_event?id=${id_event}`)
      ]);
      setTransactions(transRes.data);
      setAttenders(attendersRes.data);
      setLoading(false);
      setError(false);
    } catch (err) {
      setError(true);
      setLoading(false);
    }
  }, [id_event]);

  useEffect(() => {
    fetchData();
  }, [fetchData, refreshKey]);

  const handleRefresh = () => {
    setRefreshKey(oldKey => oldKey + 1);
  };

  const columns = [
    { Header: "Fecha", accessor: "date", align: "center" },
    { Header: "Asistente", accessor: "assistant", align: "center" },
    { Header: "Monto", accessor: "amount", align: "center" },
    { Header: "Tickets", accessor: "n_tickets", align: "center" },
    { Header: "Observaciones", accessor: "observations", align: "center" },
    { Header: "Precarga", accessor: "precharge", align: "center" },
  ];

  if (loading) return <StateMessage state="loading" message="Cargando transacciones…" />;
  if (error) return <StateMessage state="error" />;

  const getFullName = (id) => {
    const attender = attenders.find((a) => a._id === id);
    return attender ? attender.full_name : id;
  };

  transactions.sort((a, b) => {
    const dateA = new Date(a.purchase_ticket.__createdtime__);
    const dateB = new Date(b.purchase_ticket.__createdtime__);
    return dateB - dateA;
  });

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
        <Link className="custom-link" to={`/orden_boleteria/${transaction.purchase_ticket._id}`}>
          {"$"}
          {transaction.purchase_ticket.total_amount}{" "}
        </Link>
      </MDTypography>
    ),
    n_tickets: (
      <MDTypography variant="button" fontWeight="medium" style={{ color: 'inherit' }}>
         {transaction.purchase_ticket_items?.length}{" "}
      </MDTypography>
    ),
    observations: (
      <MDTypography variant="button" fontWeight="medium" style={{ color: 'inherit' }}>
         {transaction.purchase_ticket?.observation}{" "}
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
          <MDTypography color="dark" fontWeight="bold" component="div" align="left" style={{ fontSize: "1rem" }} >
            Historial de ordenes
          </MDTypography>
          <div style={{ display: "flex", alignItems: "center" }}>
            <IconButton className='custom-btn-icon' onClick={handleRefresh} aria-label="refresh">
              <RefreshIcon style={{ margin: "0px 10px", cursor:"pointer"}} fontSize="medium" />
            </IconButton>
            <Link style={{ display: "flex" }} className='custom-btn-icon custom-link' to={`${API_BASE_URL}/report/generate_report_of_ticket_manager?event_id=${id_event}`} 
            target="_blank" download title="Descargar Informe de Historial de ordenes">
              <DownloadIcon style={{ margin: "0px 10px", cursor:"pointer"}} fontSize="medium" />
            </Link>
          </div>
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