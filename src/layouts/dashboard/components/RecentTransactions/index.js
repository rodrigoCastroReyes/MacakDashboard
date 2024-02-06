import React from 'react';
import PropTypes from 'prop-types';
import { Card, CardContent, Typography, Table, TableContainer, TableHead, TableRow, TableCell, TableBody } from '@mui/material';

const RecentTransactions = ({ transactions }) => {
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Historial de transacciones recientes
        </Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Punto de venta</TableCell>
                <TableCell>Tipo</TableCell>
                <TableCell>Fecha</TableCell>
                <TableCell>Monto</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {transactions.map((transaction, index) => (
                <TableRow key={index}>
                  <TableCell>{transaction.pos}</TableCell>
                  <TableCell>{transaction.type}</TableCell>
                  <TableCell>{transaction.date}</TableCell>
                  <TableCell>{transaction.amount}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
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
