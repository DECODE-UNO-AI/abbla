import React from "react";
import { BrowserRouter, Switch } from "react-router-dom";
import { ToastContainer } from "react-toastify";

import LoggedInLayout from "../layout";
import Dashboard from "../pages/Dashboard/";
import Tickets from "../pages/Tickets/";
// import Signup from "../pages/Signup/";
import Login from "../pages/Login/";
import Connections from "../pages/Connections/";
import Settings from "../pages/Settings/";
import Users from "../pages/Users";
import Contacts from "../pages/Contacts/";
import QuickAnswers from "../pages/QuickAnswers/";
import Queues from "../pages/Queues/";
import Api from "../pages/Api/";
import ApiDocs from "../pages/ApiDocs/";
import ApiKey from "../pages/ApiKey/";
import Tags from "../pages/Tags";
import Departaments from "../pages/Departaments";
import Campaigns from "../pages/Campaigns";
import Campaign from "../pages/Campaign";
import ContactsLists from "../pages/ContactsLists";
import Macros from "../pages/Macros";

import { AuthProvider } from "../context/Auth/AuthContext";
import { WhatsAppsProvider } from "../context/WhatsApp/WhatsAppsContext";
import Route from "./Route";

const Routes = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Switch>
          <Route exact path="/login" component={Login} />
          {/* <Route exact path="/signup" component={Signup} /> */}
          <WhatsAppsProvider>
            <LoggedInLayout>
              <Route exact path="/" component={Dashboard} isPrivate />
              <Route
                exact
                path="/tickets/:ticketId?"
                component={Tickets}
                isPrivate
              />
              {process.env.REACT_APP_CAMPAIGN_FUNCTION === "true" ? (
                <>
                  <Route
                    exact
                    path="/campaigns"
                    component={Campaigns}
                    isPrivate
                  />
                  <Route
                    exact
                    path="/campaign/:campaignId"
                    component={Campaign}
                    isPrivate
                  />
                  <Route
                    exact
                    path="/contactslists"
                    component={ContactsLists}
                    isPrivate
                  />
                </>
              ) : null}
              {process.env.REACT_APP_MACRO_FUNCTION === "true" ? (
                <Route exact path="/macros" component={Macros} isPrivate />
              ) : null}
              <Route
                exact
                path="/connections"
                component={Connections}
                isPrivate
              />
              <Route exact path="/contacts" component={Contacts} isPrivate />
              <Route exact path="/users" component={Users} isPrivate />
              <Route
                exact
                path="/quickAnswers"
                component={QuickAnswers}
                isPrivate
              />
              <Route
                exact
                path="/departaments"
                component={Departaments}
                isPrivate
              />
              <Route exact path="/Settings" component={Settings} isPrivate />
              <Route exact path="/api" component={Api} isPrivate />
              <Route exact path="/apidocs" component={ApiDocs} isPrivate />
              <Route exact path="/apikey" component={ApiKey} isPrivate />
              <Route exact path="/Queues" component={Queues} isPrivate />
              <Route exact path="/Tags" component={Tags} isPrivate />
            </LoggedInLayout>
          </WhatsAppsProvider>
        </Switch>
        <ToastContainer autoClose={3000} />
      </AuthProvider>
    </BrowserRouter>
  );
};

export default Routes;
