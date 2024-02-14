import React from 'react';
import PropTypes from 'prop-types';
import moment from "moment";
import MDTypography from "components/MDTypography";
import { Card, CardContent} from '@mui/material';
import DataTable from "examples/Tables/DataTable";

const RecentTransactions = ({ transactions }) => {

    const columns = [
    {
      Header: "Punto de venta",
      accessor: "pos",
      width: "30%",
      align: "left",
    },
    { Header: "Tipo", accessor: "type", align: "left" },
    {
      Header: "Fecha",
      accessor: "date",
      align: "center",
    },
    { Header: "Monto", accessor: "amount", align: "center" },
  ];

  const rows = transactions.map((transaction) => ({
    pos: (
      <MDTypography variant="button" fontWeight="medium" style={{ color: transaction.type === 'fallida' ? 'red' : 'inherit' }}>
        {transaction.pos}
      </MDTypography>
    ),
    type: (
      <MDTypography variant="button" fontWeight="medium" style={{ color: transaction.type === 'fallida' ? 'red' : 'inherit' }}>
        {transaction.type}
      </MDTypography>
    ),
    date: (
      <MDTypography variant="caption" fontWeight="medium" style={{ color: transaction.type === 'fallida' ? 'red' : 'inherit' }}>
        {moment(transaction.date).format("DD MMM YYYY")}
      </MDTypography>
    ),
    amount: (
      <MDTypography variant="caption" fontWeight="medium" style={{ color: transaction.type === 'fallida' ? 'red' : 'inherit' }}>
        {transaction.amount}
      </MDTypography>
    ),
  }));

  return (
    <Card>
      <CardContent>
        <MDTypography variant="h6" gutterBottom>
          Historial de transacciones recientes
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

RecentTransactions.propTypes = {
  transactions: PropTypes.arrayOf(
    PropTypes.shape({
      date: PropTypes.string.isRequired,
      pos: PropTypes.string.isRequired,
      amount: PropTypes.number.isRequired,
      type: PropTypes.oneOf(['exitosa', 'fallida']).isRequired
    })
  ).isRequired
};

export default RecentTransactions;
