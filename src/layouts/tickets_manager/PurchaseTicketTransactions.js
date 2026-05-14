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

// ─── Cache helpers ────────────────────────────────────────────────────────────
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutos

const buildCacheKey = (id_event) => `purchase_tickets_cache_${id_event}`;

/**
 * Lee la caché del localStorage para un evento.
 * Retorna { transactions, attenders } si existe y no ha expirado, o null si no.
 */
const readCache = (id_event) => {
  try {
    const raw = localStorage.getItem(buildCacheKey(id_event));
    if (!raw) return null;

    const { data, timestamp } = JSON.parse(raw);
    const isExpired = Date.now() - timestamp > CACHE_TTL_MS;
    if (isExpired) {
      localStorage.removeItem(buildCacheKey(id_event));
      return null;
    }
    return data; // { transactions, attenders }
  } catch {
    return null;
  }
};

/**
 * Escribe { transactions, attenders } en el localStorage con timestamp actual.
 */
const writeCache = (id_event, transactions, attenders) => {
  try {
    const payload = {
      data: { transactions, attenders },
      timestamp: Date.now(),
    };
    localStorage.setItem(buildCacheKey(id_event), JSON.stringify(payload));
  } catch {
    // Si el localStorage está lleno u ocurre otro error, se ignora silenciosamente.
  }
};

/**
 * Elimina la caché de un evento (útil al forzar refresh).
 */
const clearCache = (id_event) => {
  localStorage.removeItem(buildCacheKey(id_event));
};
// ─────────────────────────────────────────────────────────────────────────────

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
  // Indica si los datos provienen de la caché (para mostrar feedback visual opcional)
  const [fromCache, setFromCache] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);

      // 1. Intentar leer desde caché (solo cuando no es un refresh forzado)
      const cached = readCache(id_event);
      if (cached) {
        setTransactions(cached.transactions);
        setAttenders(cached.attenders);
        setFromCache(true);
        setError(false);
        setLoading(false);
        return;
      }

      // 2. Si no hay caché válida, llamar al API
      const [transRes, attendersRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/purchase_ticket/event?id=${id_event}`),
        axios.get(`${API_BASE_URL}/purchase_ticket/attender_event?id=${id_event}`)
      ]);

      const newTransactions = transRes.data;
      const newAttenders = attendersRes.data;

      // 3. Guardar respuesta en caché
      writeCache(id_event, newTransactions, newAttenders);

      setTransactions(newTransactions);
      setAttenders(newAttenders);
      setFromCache(false);
      setError(false);
      setLoading(false);
    } catch (err) {
      setError(true);
      setLoading(false);
    }
  }, [id_event]);

  useEffect(() => {
    fetchData();
  }, [fetchData, refreshKey]);

  // Al hacer refresh manual se limpia la caché para forzar una nueva llamada al API
  const handleRefresh = () => {
    clearCache(id_event);
    setFromCache(false);
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

  if (loading) return <div>Cargando...</div>;
  if (error) return <div pt="2" pb="2" display="flex" justifyContent="center">Sin datos disponibles</div>;

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
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <MDTypography
              colorVerticalBarChart="dark"
              fontWeight="bold"
              fontFamily="montserrat-semibold"
              component="div"
              align="left"
              style={{ fontSize: "1rem" }}
            >
              Historial de ordenes
            </MDTypography>
            {/* Indicador sutil de que los datos vienen de caché */}
            {fromCache && (
              <MDTypography variant="caption" style={{ color: "#9e9e9e", fontSize: "0.7rem" }}>
                (caché)
              </MDTypography>
            )}
          </div>
          <div style={{ display: "flex", alignItems: "center" }}>
            <IconButton className='custom-btn-icon' onClick={handleRefresh} aria-label="refresh" title="Actualizar datos">
              <RefreshIcon style={{ margin: "0px 10px", cursor:"pointer"}} fontSize="medium" />
            </IconButton>
            <Link
              style={{ display: "flex" }}
              className='custom-btn-icon custom-link'
              to={`${API_BASE_URL}/report/generate_report_of_ticket_manager?event_id=${id_event}`}
              target="_blank"
              download
              title="Descargar Informe de Historial de ordenes"
            >
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