/**
=========================================================
* Material Dashboard 2 React - v2.2.0
=========================================================

* Product Page: https://www.creative-tim.com/product/material-dashboard-react
* Copyright 2023 Creative Tim (https://www.creative-tim.com)

Coded by www.creative-tim.com

 =========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
*/

import { useMemo, useEffect, useState } from "react";

// prop-types is a library for typechecking of props
import PropTypes from "prop-types";

// react-table components
import { useTable, usePagination, useGlobalFilter, useAsyncDebounce, useSortBy } from "react-table";

// @mui material components
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableContainer from "@mui/material/TableContainer";
import TableRow from "@mui/material/TableRow";
import Icon from "@mui/material/Icon";
import Autocomplete from "@mui/material/Autocomplete";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDPagination from "components/MDPagination";

// Material Dashboard 2 React example components
import DataTableHeadCell from "examples/Tables/DataTable/DataTableHeadCell";
import DataTableBodyCell from "examples/Tables/DataTable/DataTableBodyCell";

function DataTable({
  entriesPerPage = { defaultValue: 10, entries: [5, 10, 15, 20, 25] },
  canSearch = false,
  showTotalEntries = true,
  table,
  pagination = { variant: "gradient", color: "info" },
  isSorted = true,
  noEndBorder = false,
  onRowClick,
}) {
  const defaultValue = entriesPerPage.defaultValue ? entriesPerPage.defaultValue : 50;
  const entries = entriesPerPage.entries
    ? entriesPerPage.entries.map((el) => el.toString())
    : ["5", "10", "15", "20", "25"];
  const columns = useMemo(() => table.columns, [table]);
  const data = useMemo(() => table.rows, [table]);

  const tableInstance = useTable(
    { columns, data, initialState: { pageIndex: 0 } },
    useGlobalFilter,
    useSortBy,
    usePagination
  );

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,
    rows,
    page,
    pageOptions,
    canPreviousPage,
    canNextPage,
    gotoPage,
    nextPage,
    previousPage,
    setPageSize,
    setGlobalFilter,
    state: { pageIndex, pageSize, globalFilter },
  } = tableInstance;

  var isEmpty = true;
  if(rows.length === 0 ){
    isEmpty = true;
  }else{
    isEmpty = false;
  }

  // Set the default value for the entries per page when component mounts
  useEffect(() => {
    setPageSize(defaultValue || 25);
  }, [defaultValue, setPageSize]);

  // Set the entries per page value based on the select value
  const setEntriesPerPage = (value) => setPageSize(value);

  // Render the paginations
  const renderPagination = pageOptions.map((option) => (
    <MDPagination
      item
      key={option}
      onClick={() => gotoPage(Number(option))}
      active={pageIndex === option}
    >
      {option + 1}
    </MDPagination>
  ));

  // Handler for the input to set the pagination index
  const handleInputPagination = ({ target: { value } }) =>
    value > pageOptions.length || value < 0 ? gotoPage(0) : gotoPage(Number(value));

  // Customized page options starting from 1
  const customizedPageOptions = pageOptions.map((option) => option + 1);

  // Setting value for the pagination input
  const handleInputPaginationValue = ({ target: value }) => gotoPage(Number(value.value - 1));

  // Search input value state
  const [search, setSearch] = useState(globalFilter);

  // Search input state handle
  const onSearchChange = useAsyncDebounce((value) => {
    setGlobalFilter(value || undefined);
  }, 100);

  // A function that sets the sorted value for the table
  const setSortedValue = (column) => {
    let sortedValue;

    if (isSorted && column.isSorted) {
      sortedValue = column.isSortedDesc ? "desc" : "asce";
    } else if (isSorted) {
      sortedValue = "none";
    } else {
      sortedValue = false;
    }

    return sortedValue;
  };

  // Setting the entries starting point
  const entriesStart = pageIndex === 0 ? pageIndex + 1 : pageIndex * pageSize + 1;

  // Setting the entries ending point
  let entriesEnd;

  if (pageIndex === 0) {
    entriesEnd = pageSize;
  } else if (pageIndex === pageOptions.length - 1) {
    entriesEnd = rows.length;
  } else {
    entriesEnd = pageSize * (pageIndex + 1);
  }
  if(!isEmpty){
    return (    
      <TableContainer sx={{ boxShadow: "none" }}>
        {entriesPerPage || canSearch ? (
          <MDBox display="flex" justifyContent="space-between" alignItems="center" p={3}>
            {entriesPerPage && (
              <MDBox display="flex" alignItems="center">
                <Autocomplete
                  disableClearable
                  value={pageSize.toString()}
                  options={entries}
                  onChange={(event, newValue) => {
                    setEntriesPerPage(parseInt(newValue, 10));
                  }}
                  size="small"
                  sx={{ width: "5rem" }}
                  renderInput={(params) => <MDInput {...params} />}
                />
                <MDTypography variant="caption" color="secondary">
                  &nbsp;&nbsp;entries per page
                </MDTypography>
              </MDBox>
            )}
            {canSearch && (
              <MDBox width="12rem" ml="auto">
                <MDInput
                  placeholder="Search..."
                  value={search}
                  size="small"
                  fullWidth
                  onChange={({ currentTarget }) => {
                    setSearch(search);
                    onSearchChange(currentTarget.value);
                  }}
                />
              </MDBox>
            )}
          </MDBox>
        ) : null}
        <Table {...getTableProps()}>
          <MDBox component="thead">
            {headerGroups.map((headerGroup, key) => {
              // react-table devuelve `key` dentro de los props; React 19 avisa si se
              // pasa por spread. Se extrae para pasarla aparte: con miles de filas,
              // ese aviso se dispara por cada celda y llega a congelar la vista.
              const { key: headerKey, ...headerGroupProps } = headerGroup.getHeaderGroupProps();
              return (
                <TableRow key={headerKey ?? key} {...headerGroupProps}>
                  {headerGroup.headers.map((column, idx) => {
                    const { key: colKey, ...colProps } = column.getHeaderProps(
                      isSorted && column.getSortByToggleProps()
                    );
                    return (
                      <DataTableHeadCell
                        key={colKey ?? idx}
                        {...colProps}
                        width={column.width ? column.width : "auto"}
                        align={column.align ? column.align : "left"}
                        sorted={setSortedValue(column)}
                      >
                        {column.render("Header")}
                      </DataTableHeadCell>
                    );
                  })}
                  {onRowClick && <DataTableHeadCell width="3rem" align="right" sorted={false} />}
                </TableRow>
              );
            })}
          </MDBox>
          <TableBody {...getTableBodyProps()}>
            {page.map((row, key) => {
              prepareRow(row);
              const { key: rowKey, ...rowProps } = row.getRowProps();
              return (
                <TableRow
                  key={rowKey ?? key}
                  {...rowProps}
                  onClick={onRowClick ? () => onRowClick(row.original) : undefined}
                  sx={
                    onRowClick
                      ? ({ palette, transitions }) => ({
                          cursor: "pointer",
                          transition: transitions.create("background-color"),
                          "&:hover": { backgroundColor: palette.grey[100] },
                        })
                      : undefined
                  }
                >
                  {row.cells.map((cell, idx) => {
                    const { key: cellKey, ...cellProps } = cell.getCellProps();
                    return (
                      <DataTableBodyCell
                        key={cellKey ?? idx}
                        noBorder={noEndBorder && rows.length - 1 === key}
                        align={cell.column.align ? cell.column.align : "left"}
                        {...cellProps}
                      >
                        {cell.render("Cell")}
                      </DataTableBodyCell>
                    );
                  })}
                  {onRowClick && (
                    <DataTableBodyCell
                      align="right"
                      noBorder={noEndBorder && rows.length - 1 === key}
                    >
                      <Icon fontSize="small" sx={{ color: "text.main", opacity: 0.5, display: "block" }}>
                        chevron_right
                      </Icon>
                    </DataTableBodyCell>
                  )}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>

        <MDBox
          display="flex"
          flexDirection={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", sm: "center" }}
          p={!showTotalEntries && pageOptions.length === 1 ? 0 : 3}
        >
          {showTotalEntries && (
            <MDBox mb={{ xs: 3, sm: 0 }}>
              <MDTypography variant="button" color="secondary" fontWeight="regular">
                Showing {entriesStart} to {entriesEnd} of {rows.length} entries
              </MDTypography>
            </MDBox>
          )}
          {pageOptions.length > 1 && (
            <MDPagination
              variant={pagination.variant ? pagination.variant : "gradient"}
              color={pagination.color ? pagination.color : "info"}
            >
              {canPreviousPage && (
                <MDPagination item onClick={() => previousPage()}>
                  <Icon sx={{ fontWeight: "bold" }}>chevron_left</Icon>
                </MDPagination>
              )}
              {renderPagination.length > 6 ? (
                <MDBox width="5rem" mx={1}>
                  <MDInput
                    inputProps={{ type: "number", min: 1, max: customizedPageOptions.length }}
                    value={customizedPageOptions[pageIndex]}
                    onChange={(handleInputPagination, handleInputPaginationValue)}
                  />
                </MDBox>
              ) : (
                renderPagination
              )}
              {canNextPage && (
                <MDPagination item onClick={() => nextPage()}>
                  <Icon sx={{ fontWeight: "bold" }}>chevron_right</Icon>
                </MDPagination>
              )}
            </MDPagination>
          )}
        </MDBox>
      </TableContainer>
    );
  }else{
    return (
      <div className="empty-container">
        Sin datos disponibles
      </div>
    );
  }
}

// Typechecking props for the DataTable
DataTable.propTypes = {
  entriesPerPage: PropTypes.oneOfType([
    PropTypes.shape({
      defaultValue: PropTypes.number,
      entries: PropTypes.arrayOf(PropTypes.number),
    }),
    PropTypes.bool,
  ]),
  canSearch: PropTypes.bool,
  showTotalEntries: PropTypes.bool,
  table: PropTypes.objectOf(PropTypes.array).isRequired,
  pagination: PropTypes.shape({
    variant: PropTypes.oneOf(["contained", "gradient"]),
    color: PropTypes.oneOf([
      "primary",
      "secondary",
      "info",
      "success",
      "warning",
      "error",
      "dark",
      "light",
    ]),
  }),
  isSorted: PropTypes.bool,
  noEndBorder: PropTypes.bool,
  onRowClick: PropTypes.func,
};

export default DataTable;
