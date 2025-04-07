import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import moment from "moment";
import MDTypography from "components/MDTypography";
import { Card, CardContent } from '@mui/material';
import DataTable from "examples/Tables/DataTable";
import axios from "axios";

// Variable Global
import { API_BASE_URL } from '../../config';

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
        {transaction.purchase_ticket.total_amount}
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
        <MDTypography variant="h4" gutterBottom>
          Historial de ordenes
        </MDTypography>
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
