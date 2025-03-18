import React from 'react';
import PropTypes from 'prop-types';
import moment from "moment";
import MDTypography from "components/MDTypography";
import { Card, CardContent} from '@mui/material';
import DataTable from "examples/Tables/DataTable";
import useAxios from "hooks/useAxios";
import { Link } from 'react-router-dom';
import { styled } from "@mui/system";
import DownloadIcon from '@mui/icons-material/Download';


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
  const url = "https://biodynamics.tech/macak_dev/";

  const { data, loading, error } = useAxios(
    `${url}/purchase_ticket/event?id=${id_event}`
  );

  const columns = [
    {
      Header: "Fecha",
      accessor: "date",
      align: "center",
    },
    {
      Header: "Asistente",
      accessor: "assistant",
      align: "center",
    },
    {
      Header: "Cooreo",
      accessor: "email",
      align: "center",
    },
    { Header: "Monto de compra", accessor: "amount", align: "center" },
    { Header: "Saldo precargado", accessor: "precharge", align: "center" },
  ];

  if (loading) return <div>Cargando...</div>;
  
  if (error)
    return <div pt="2" pb="2" display="flex" justifyContent="center">Sin datos disponibles</div>;

  const rows = data.map((transaction) => ({
    date: (
      <MDTypography variant="caption" fontWeight="medium" style={{ color: 'inherit' }}>
        {moment(transaction.__updatedtime__).format("DD MMM YYYY HH:mm")}
      </MDTypography>
    ),
    assistant: (
      <MDTypography variant="button" fontWeight="medium" style={{ color: 'inherit' }}>
        {transaction.full_name_attender}
      </MDTypography>
    ),
    email: (
      <MDTypography variant="button" fontWeight="medium" style={{ color: 'inherit' }}>
        {transaction.name_email_attender}
      </MDTypography>
    ),
    amount: (
      <MDTypography variant="button" fontWeight="medium" style={{ color: 'inherit' }}>
        <Link className="custom-link" to={`/orden_boleteria/${transaction._id}`}>
          {"$"}
          {transaction.total_amount}{" "}
        </Link>       
      </MDTypography>
    ),
    precharge: (
      <MDTypography variant="button" fontWeight="medium" style={{ color: 'inherit' }}>
       $ {transaction.precharge_amount}
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
          <Link className='custom-btn-icon custom-link' to={`${url}report/generate_report_of_ticket_manager?event_id=${id_event}`} target="_blank" download>
            <DownloadIcon style={{ margin: "0px 10px", cursor:"pointer"}} fontSize="medium"  />
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


export default PurchaseTicketsTransactions;
