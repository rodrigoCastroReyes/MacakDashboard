import React, { useEffect, useState, useCallback, useMemo } from 'react';
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
import { isUnpaidPurchase } from "utils/purchaseStatus";

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
        axios.get(`${API_BASE_URL}/purchase_ticket/event/completed?id=${id_event}`),
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

  // Memoizadas para que su identidad sea estable entre renders. DataTable
  // (react-table v7) reprocesa toda la tabla cuando cambia la referencia de
  // `columns`/`data`; con más de mil filas cuyos valores de celda son elementos
  // React, recrearlas en cada render disparaba ese reproceso una y otra vez y
  // congelaba la vista (un evento con ~1000 compras colgaba /boleteria).
  const columns = useMemo(
    () => [
      { Header: "Fecha", accessor: "date", align: "center" },
      { Header: "Asistente", accessor: "assistant", align: "center" },
      { Header: "Monto", accessor: "amount", align: "center" },
      { Header: "Tickets", accessor: "n_tickets", align: "center" },
      { Header: "Observaciones", accessor: "observations", align: "center" },
      { Header: "Precarga", accessor: "precharge", align: "center" },
    ],
    []
  );

  // Nombre del asistente por id en O(1): antes era un `find` por fila, que con
  // miles de compras y asistentes se volvía O(n·m).
  const attenderNameById = useMemo(() => {
    const map = new Map();
    attenders.forEach((a) => map.set(a._id, a.full_name));
    return map;
  }, [attenders]);

  const rows = useMemo(() => {
    // Las ordenes se crean antes de pagar, asi que un intento abandonado queda
    // guardado como una orden mas. Aqui se muestran solo las pagadas: una compra
    // que nadie pago no es una venta. Se copia antes de ordenar porque
    // `transactions` es estado y no debe mutarse en render.
    const visibleTransactions = transactions
      .filter((t) => !isUnpaidPurchase(t.purchase_ticket))
      .slice()
      .sort(
        (a, b) =>
          new Date(b.purchase_ticket.__createdtime__) -
          new Date(a.purchase_ticket.__createdtime__)
      );

    return visibleTransactions.map((transaction) => ({
      date: (
        <MDTypography variant="caption" fontWeight="medium" style={{ color: 'inherit' }}>
          {moment(transaction.purchase_ticket.__createdtime__).format("DD MMM YYYY HH:mm")}
        </MDTypography>
      ),
      assistant: (
        <MDTypography variant="button" fontWeight="medium" style={{ color: 'inherit' }}>
          {attenderNameById.get(transaction.purchase_ticket.attender_id) ||
            transaction.purchase_ticket.attender_id}
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
  }, [transactions, attenderNameById]);

  // Identidad estable del prop `table`: DataTable lo usa como dependencia de
  // sus propios useMemo internos.
  const tableData = useMemo(() => ({ columns, rows }), [columns, rows]);

  if (loading) return <StateMessage state="loading" message="Cargando transacciones…" />;
  if (error) return <StateMessage state="error" />;

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
          table={tableData}
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