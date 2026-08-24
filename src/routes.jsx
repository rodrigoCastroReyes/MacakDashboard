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

/**
  Application routes.

  - `type: "collapse"` renders the entry in the Sidenav; `type: "route"` is
    reachable by URL only.
  - `name` is the label shown in the Sidenav (kept in Spanish for end users).
  - `key` must be unique: it is used as the React key when the routes are mapped.
  - `route` is the react-router path, `component` the element to render.

  Route URLs are intentionally left in Spanish so existing bookmarks keep working.
*/

// Layouts
import Summary from "layouts/summary";
import Tokens from "layouts/tokens";
import Transactions from "layouts/transactions";
import TokenDetailHistory from "layouts/tokens/TokenDetailHistory";
import PointOfSaleTransactionHistory from "layouts/transactions/PointOfSaleTransactionHistory";
import SignIn from "layouts/authentication/sign-in";
import RefundedTransactions from "layouts/refunds";
import VoidedTransactions from "layouts/voided-transactions";
import Ticketing from "layouts/ticketing";
import OrderTicketManager from "layouts/ticketing/OrderTicketManager";
import Attendees from "layouts/attendees";
import AttendeeDetails from "layouts/attendees/AttendeeDetails";
import Shops from "layouts/shops";
import Products from "layouts/shops/Products";
import TokenAdminSummary from "layouts/token-admins/TokenAdminSummary";
import TokenAdminTransactions from "layouts/token-admins/TokenAdminTransactions";

// @mui icons
import AttachMoneySharpIcon from "@mui/icons-material/AttachMoneySharp";
import CurrencyExchangeSharpIcon from "@mui/icons-material/CurrencyExchangeSharp";
import DoNotDisturbOnSharpIcon from "@mui/icons-material/DoNotDisturbOnSharp";
import NfcIcon from "@mui/icons-material/Nfc";
import UserIcon from "@mui/icons-material/Person";
import BarChartIcon from "@mui/icons-material/BarChart";
import PeopleIcon from "@mui/icons-material/People";
import StoreIcon from "@mui/icons-material/Store";

const routes = [
  {
    type: "collapse",
    name: "Resumen",
    key: "summary",
    icon: <BarChartIcon fontSize="small" color="white" />,
    route: "/resumen",
    component: <Summary />,
  },
  {
    type: "collapse",
    name: "Tokens",
    key: "tokens",
    icon: <NfcIcon fontSize="small" color="white" />,
    route: "/tokens",
    component: <Tokens />,
  },
  {
    type: "collapse",
    name: "Administradores",
    key: "token-admins",
    icon: <UserIcon fontSize="small" color="white" />,
    route: "/tokens_admin",
    component: <TokenAdminSummary />,
  },
  {
    type: "route",
    key: "token-admin-details",
    route: "/tokens_admin_details/:id_user",
    component: <TokenAdminTransactions />,
  },
  {
    type: "route",
    key: "point-of-sale-transaction",
    route: "/transaccion/:id",
    component: <PointOfSaleTransactionHistory />,
  },
  // "Transacciones" queda fuera del menú: hoy no muestra nada. La pantalla pide
  // /dashboard/event y luego exige `data.event_id` en la respuesta, que ese
  // endpoint no devuelve, así que siempre cae en el mensaje de error.
  // Para reactivarla hay que descomentar también su import y el de
  // AttachMoneySharpIcon.
  // {
  //   type: "collapse",
  //   name: "Transacciones",
  //   key: "transactions",
  //   icon: <AttachMoneySharpIcon fontSize="small" color="white" />,
  //   route: "/transacciones",
  //   component: <Transactions />,
  // },
  {
    type: "collapse",
    name: "Anulaciones",
    key: "voided-transactions",
    icon: <DoNotDisturbOnSharpIcon fontSize="small" color="white" />,
    route: "/recharge_canceled",
    component: <VoidedTransactions />,
  },
  {
    type: "collapse",
    name: "Reembolsos",
    key: "refunds",
    icon: <CurrencyExchangeSharpIcon fontSize="small" color="white" />,
    route: "/refunded",
    component: <RefundedTransactions />,
  },
  {
    type: "route",
    key: "token-detail",
    route: "/token/:id",
    component: <TokenDetailHistory />,
  },
  {
    type: "collapse",
    name: "Boleteria",
    key: "ticketing",
    icon: <BarChartIcon fontSize="small" color="white" />,
    route: "/boleteria",
    component: <Ticketing />,
  },
  {
    type: "collapse",
    name: "Asistentes",
    key: "attendees",
    icon: <PeopleIcon fontSize="small" color="white" />,
    route: "/asistentes",
    component: <Attendees />,
  },
  {
    type: "route",
    key: "order-ticket",
    route: "/orden_boleteria/:id",
    component: <OrderTicketManager />,
  },
  {
    type: "route",
    key: "sign-in",
    route: "/authentication/sign-in",
    component: <SignIn />,
  },
  {
    type: "route",
    key: "attendee-details",
    route: "/attender-details/:id",
    component: <AttendeeDetails />,
  },
  {
    type: "collapse",
    name: "Tiendas",
    key: "shops",
    icon: <StoreIcon fontSize="small" color="white" />,
    route: "/tiendas",
    component: <Shops />,
  },
  {
    type: "route",
    key: "shop-products",
    route: "/shop-products/:id",
    component: <Products />,
  },
];

export default routes;
