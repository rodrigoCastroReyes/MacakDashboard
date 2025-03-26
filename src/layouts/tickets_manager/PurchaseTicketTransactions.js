import React from 'react';
import PropTypes from 'prop-types';
import moment from "moment";
import MDTypography from "components/MDTypography";
import { Card, CardContent} from '@mui/material';
import DataTable from "examples/Tables/DataTable";
import useAxios from "hooks/useAxios";


const PurchaseTicketsTransactions = ({ id_event }) => {

    const { data, loading, error } = useAxios(
      `https://biodynamics.tech/macak_dev/purchase_ticket/event?id=${id_event}`
    );

    const columns = [
    {Header: "Fecha", accessor: "date", align: "center",},
    {Header: "Asistente", accessor: "assistant", align: "center",},
    {Header: "Monto", accessor: "amount", align: "center" },
    {Header: "Precarga", accessor: "precharge", align: "center" },
  ];

  if (loading) return <div>Cargando...</div>;
  
  if (error)
    return <div pt="2" pb="2" display="flex" justifyContent="center">Sin datos disponibles</div>;

  const rows = data.map((transaction) => ({
    date: (
      <MDTypography variant="caption" fontWeight="medium" style={{ color: 'inherit' }}>
        {moment(transaction.__createdtime__).format("DD MMM YYYY HH:mm")}
      </MDTypography>
    ),
    assistant: (
      <MDTypography variant="button" fontWeight="medium" style={{ color: 'inherit' }}>
        {transaction.attender_id}
      </MDTypography>
    ),
    amount: (
      <MDTypography variant="button" fontWeight="medium" style={{ color: 'inherit' }}>
        {transaction.total_amount}
      </MDTypography>
    ),
    precharge: (
      <MDTypography variant="button" fontWeight="medium" style={{ color: 'inherit' }}>
        {transaction.precharge_amount}
      </MDTypography>
    ),
  }));

  return (
    <Card>
      <CardContent>
        <MDTypography variant="h6" gutterBottom>
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


export default PurchaseTicketsTransactions;
