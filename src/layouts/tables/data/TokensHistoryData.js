import MDTypography from "components/MDTypography";
import useAxios from "hooks/useAxios";
import moment from "moment";
import DataTable from "examples/Tables/DataTable";

function TokensHistory() {
  const { data, loading, error } = useAxios(
    "https://biodynamics.tech/api_tokens/event/tokens?id=f9b857ac-16f2-4852-8981-b72831e7f67c"
  );

  if (!data?._id || !data?.tokens) return <div>No hay datos disponibles</div>;

  // Extracción de datos relevantes
  const tokens = data?.tokens;

  // Definición de las columnas de la tabla
  const columns =
    (() => [
      {
        Header: "Id del Token",
        accessor: "IdToken",
        width: "30%",
        align: "left",
      },
      { Header: "Estado", accessor: "Estado", align: "left" },
      {
        Header: "Fecha de registro",
        accessor: "FechaRegistro",
        align: "center",
      },
      { Header: "Monto", accessor: "Monto", align: "center" },
    ],
    []);

  // Datos para la tabla
  const tableData = tokens
    ? tokens.map((token) => ({
        IdToken: (
          <MDTypography
            component="a"
            href="#"
            variant="button"
            color="text"
            fontWeight="medium"
          >
            {token.code}
          </MDTypography>
        ),
        Estado: (
          <MDTypography
            component="a"
            href="#"
            variant="button"
            color="text"
            fontWeight="medium"
          >
            {token.status}
          </MDTypography>
        ),
        FechaRegistro: (
          <MDTypography
            component="a"
            href="#"
            variant="caption"
            color="text"
            fontWeight="medium"
          >
            {moment(token.__createdtime__).format("DD/MM/YYYY")}
          </MDTypography>
        ),
        Monto: (
          <MDTypography
            component="a"
            href="#"
            variant="caption"
            color="text"
            fontWeight="medium"
          >
            {token.balance}
          </MDTypography>
        ),
      }))
    : [];

  return (
    <DataTable
      table={{ columns, rows: tableData }}
      isSorted={false}
      entriesPerPage={false}
      showTotalEntries={false}
      noEndBorder
    />
  );
}

export default TokensHistory;
