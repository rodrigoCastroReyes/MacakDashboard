import React, { useState } from "react";
import moment from "moment";
import MDTypography from "components/MDTypography";
import useAxios from "hooks/useAxios";
import DataTable from "examples/Tables/DataTable";
import "css/buttonStyles.css";

function TokensHistory() {
  const [refreshing, setRefreshing] = useState(false);
  const { data, loading, error, refetch } = useAxios(
    "https://biodynamics.tech/api_tokens/event/tokens?id=f9b857ac-16f2-4852-8981-b72831e7f67c"
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  if (loading) return <div>Cargando...</div>;
  if (error || !data?._id || !data?.tokens) return <div>Error al obtener los datos</div>;

  const tokens = data?.tokens;

  const columns = [
    {
      Header: "Código del Token",
      accessor: "code",
      width: "30%",
      align: "left",
    },
    { Header: "Estado", accessor: "status", align: "left" },
    {
      Header: "Fecha de Registro",
      accessor: "registrationDate",
      align: "center",
    },
    { Header: "Monto", accessor: "balance", align: "center" },
  ];

  const rows = tokens.map((token) => ({
    code: (
      <MDTypography variant="button" color="text" fontWeight="medium">
        {token.code}
      </MDTypography>
    ),
    status: (
      <MDTypography variant="button" color="text" fontWeight="medium">
        {token.status === 'registered' ? 'Registrado' : 'No Registrado'}
      </MDTypography>
    ),
    registrationDate: (
      <MDTypography variant="caption" color="text" fontWeight="medium">
        {moment(token.__createdtime__).format("DD MMM YYYY")}
      </MDTypography>
    ),
    balance: (
      <MDTypography variant="caption" color="text" fontWeight="medium">
        ${token.balance}
      </MDTypography>
    ),
  }));

  return (
    <>
      <div style={{ marginBottom: "2rem" }}>
        <button  className="refresh-button" onClick={handleRefresh} disabled={refreshing}>
          {refreshing ? "Refrescando..." : "Actualizar"}
        </button>
      </div>
      <DataTable
        table={{ columns, rows }}
        isSorted={false}
        entriesPerPage={false}
        showTotalEntries={false}
        noEndBorder
      />
    </>
  );
}

export default TokensHistory;

