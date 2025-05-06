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
  All of the routes for the Material Dashboard 2 React are added here,
  You can add a new route, customize the routes and delete the routes here.

  Once you add a new route on this file it will be visible automatically on
  the Sidenav.

  For adding a new route you can follow the existing routes in the routes array.
  1. The `type` key with the `collapse` value is used for a route.
  2. The `type` key with the `title` value is used for a title inside the Sidenav.
  3. The `type` key with the `divider` value is used for a divider between Sidenav items.
  4. The `name` key is used for the name of the route on the Sidenav.
  5. The `key` key is used for the key of the route (It will help you with the key prop inside a loop).
  6. The `icon` key is used for the icon of the route on the Sidenav, you have to add a node.
  7. The `collapse` key is used for making a collapsible item on the Sidenav that has other routes
  inside (nested routes), you need to pass the nested routes inside an array as a value for the `collapse` key.
  8. The `route` key is used to store the route location which is used for the react router.
  9. The `href` key is used to store the external links location.
  10. The `title` key is only for the item with the type of `title` and its used for the title text on the Sidenav.
  10. The `component` key is used to store the component of its route.
*/

// Material Dashboard 2 React layouts
import Resumen from "layouts/resumen";
import Tokens from "layouts/tokens";
import Transacciones from "layouts/transacciones"
import TokenDetailHistory from "layouts/tokens/TokenDetailHistory";
import PointOfSaleTransactionHistory from "layouts/transacciones/pointOfSaleTransactionHistory";
import SignIn from "layouts/authentication/sign-in";
// @mui icons
import QueryStatsIcon from '@mui/icons-material/QueryStats';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import PointOfSaleIcon from '@mui/icons-material/PointOfSale';
import AttachMoneySharpIcon from '@mui/icons-material/AttachMoneySharp';
import CurrencyExchangeSharpIcon from '@mui/icons-material/CurrencyExchangeSharp';
import DoNotDisturbOnSharpIcon from '@mui/icons-material/DoNotDisturbOnSharp';
import NfcIcon from '@mui/icons-material/Nfc';
import BarChartIcon from '@mui/icons-material/BarChart';
import PeopleIcon from '@mui/icons-material/People';
import StoreIcon from '@mui/icons-material/Store';

import AnalyticsIcon from '@mui/icons-material/Analytics';
import Reports from "layouts/reportes";
import RefundedTransactions from "layouts/order_transactions";
import AnulledTransactions from "layouts/anulled_transactions";
import Boleteria from "layouts/tickets_manager";
import OrderTicketManager from "layouts/tickets_manager/OrderTicketManager";

import Asistentes from "layouts/assistants";
import AttenderDetails from "layouts/assistants/AttenderDetails";

import Tiendas from "layouts/shops";
import Products from "layouts/shops/Products";

const routes = [
  {
    type: "collapse",
    name: "Resumen",
    key: "resumen",
    icon: <BarChartIcon fontSize="small" color="white"></BarChartIcon>,
    route: "/resumen",
    component: <Resumen />,
  },
  {
    type: "collapse",
    name: "Tokens",
    key: "tokens",
    icon: <NfcIcon fontSize="small" color="white"></NfcIcon>,
    route: "/tokens",
    component: <Tokens />,
  },
  {
    type: "route",
    key: "transaccion",
    route: "/transaccion/:id",
    component: <PointOfSaleTransactionHistory />,
  },
  {
    type: "collapse",
    name: "Transacciones",
    key: "transacciones",
    icon: <AttachMoneySharpIcon  fontSize="small" color="white"></AttachMoneySharpIcon>,
    route: "/transacciones",
    component: <Transacciones />,
  },
  {
    type: "collapse",
    name: "Anulaciones",
    key: "recharged_anulled",
    icon: <DoNotDisturbOnSharpIcon  fontSize="small" color="white"></DoNotDisturbOnSharpIcon>,
    route: "/recharge_canceled",
    component: <AnulledTransactions />,
  },
  {
    type: "collapse",
    name: "Reembolsos",
    key: "refunding",
    icon: <CurrencyExchangeSharpIcon  fontSize="small" color="white"></CurrencyExchangeSharpIcon>,
    route: "/refunded",
    component: <RefundedTransactions />,
  },
  {
    type: "route",
    key: "token",
    route: "/token/:id",
    component: <TokenDetailHistory />,
  },
  {
    type: "collapse",
    name: "Boleteria",
    key: "boleteria",
    icon: <BarChartIcon fontSize="small" color="white"></BarChartIcon>,
    route: "/boleteria",
    component: <Boleteria />,
  },
  {
    type: "collapse",
    name: "Asistentes",
    key: "asistentes",
    icon: <PeopleIcon fontSize="small" color="white"></PeopleIcon>,
    route: "/asistentes",
    component: <Asistentes />,
  },
  {
    type: "route",
    key: "order_ticket",
    route: "/orden_boleteria/:id",
    component: <OrderTicketManager />,
  },
  {
    type: "route",
    route: "/authentication/sign-in",
    component: <SignIn />,
  },
  {
    type: "route",
    key: "attender-details",
    route: "/attender-details/:id",
    component: <AttenderDetails />,
  },
  {
    type: "collapse",
    name: "Tiendas",
    key: "tiendas",
    icon: <StoreIcon fontSize="small" color="white"></StoreIcon>,
    route: "/tiendas",
    component: <Tiendas />,
  },
  {
    type: "route",
    key: "shop-products",
    route: "/shop-products/:id",
    component: <Products />,
  }
];

export default routes;
