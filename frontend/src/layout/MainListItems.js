import React, { useContext, useEffect, useState } from "react";
import { Link as RouterLink } from "react-router-dom";

import {
  Badge,
  Divider,
  Link,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListSubheader,
  makeStyles,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@material-ui/core";

import {
  AccountTreeOutlined,
  Code,
  ContactPhoneOutlined,
  DashboardOutlined,
  LocalOffer,
  MenuBook,
  PeopleAltOutlined,
  QuestionAnswerOutlined,
  SettingsOutlined,
  SyncAlt,
  VpnKeyRounded,
  WhatsApp,
  DnsOutlined,
  PhonelinkRing,
  ListAlt,
  ExpandMore,
  QueuePlayNext,
  LoopOutlined,
} from "@material-ui/icons";

import { i18n } from "../translate/i18n";
import { WhatsAppsContext } from "../context/WhatsApp/WhatsAppsContext";
import { AuthContext } from "../context/Auth/AuthContext";
import { Can } from "../components/Can";
import { systemVersion } from "../../package.json";
import { system } from "../config.json";

const useStyles = makeStyles((theme) => ({
  icon: {
    color: theme.palette.secondary.main,
  },
  li: {
    backgroundColor: theme.palette.menuItens.main,
    width: "100%",
  },
  sub: {
    backgroundColor: theme.palette.sub.main,
  },
  divider: {
    backgroundColor: theme.palette.divide.main,
  },
  systemCss: {
    display: "flex",
    justifyContent: "center",
    opacity: 0.5,
    fontSize: 12,
  },

  "@global": {
    ".MuiAccordion-root:before": {
      display: "none",
    },
  },
}));

function ListItemLink(props) {
  const { icon, primary, to, className } = props;
  const classes = useStyles();

  const renderLink = React.useMemo(
    () =>
      React.forwardRef((itemProps, ref) => (
        <RouterLink to={to} ref={ref} {...itemProps} />
      )),
    [to]
  );

  return (
    <li className={classes.li}>
      <ListItem button component={renderLink} className={className}>
        {icon ? (
          <ListItemIcon className={classes.icon}>{icon}</ListItemIcon>
        ) : null}
        <ListItemText primary={primary} />
      </ListItem>
    </li>
  );
}

const MainListItems = (props) => {
  const { drawerClose } = props;
  const { whatsApps } = useContext(WhatsAppsContext);
  const { user } = useContext(AuthContext);
  const [connectionWarning, setConnectionWarning] = useState(false);
  const classes = useStyles();

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (whatsApps.length > 0) {
        const offlineWhats = whatsApps.filter((whats) => {
          return (
            whats.status === "qrcode" ||
            whats.status === "PAIRING" ||
            whats.status === "DISCONNECTED" ||
            whats.status === "TIMEOUT" ||
            whats.status === "OPENING"
          );
        });
        if (offlineWhats.length > 0) {
          setConnectionWarning(true);
        } else {
          setConnectionWarning(false);
        }
      }
    }, 2000);
    return () => clearTimeout(delayDebounceFn);
  }, [whatsApps]);

  return (
    <div>
      <div onClick={drawerClose}>
        <ListItemLink to="/" primary="Dashboard" icon={<DashboardOutlined />} />
      </div>
      <div onClick={drawerClose}>
        <ListItemLink
          to="/tickets"
          primary={i18n.t("mainDrawer.listItems.tickets")}
          icon={<WhatsApp />}
        />
      </div>
      <div onClick={drawerClose}>
        <ListItemLink
          to="/contacts"
          primary={i18n.t("mainDrawer.listItems.contacts")}
          icon={<ContactPhoneOutlined />}
        />
      </div>
      <div onClick={drawerClose}>
        <ListItemLink
          to="/quickAnswers"
          primary={i18n.t("mainDrawer.listItems.quickAnswers")}
          icon={<QuestionAnswerOutlined />}
        />
      </div>
      <div onClick={drawerClose}>
        <ListItemLink
          to="/tags"
          primary={i18n.t("mainDrawer.listItems.tags")}
          icon={<LocalOffer />}
        />
      </div>
      <Can
        role={user.profile}
        perform="drawer-supervisor-items:view"
        yes={() => (
          <>
            <Divider className={classes.divider} />
            <ListSubheader inset className={classes.sub}>
              {i18n.t("mainDrawer.listItems.administration")}
            </ListSubheader>
            <div onClick={drawerClose}>
              <ListItemLink
                to="/connections"
                primary={i18n.t("mainDrawer.listItems.connections")}
                icon={
                  <Badge
                    badgeContent={connectionWarning ? "!" : 0}
                    color="error"
                  >
                    <SyncAlt />
                  </Badge>
                }
              />
            </div>
          </>
        )}
      />
      <Can
        role={user.profile}
        perform="drawer-admin-items:view"
        yes={() => (
          <>
            <Divider className={classes.divider} />
            <ListSubheader inset className={classes.sub}>
              {i18n.t("mainDrawer.listItems.administration")}
            </ListSubheader>
            {process.env.REACT_APP_CAMPAIGN_FUNCTION === "true" ? (
              <Accordion
                style={{ boxShadow: "none", width: "100%", margin: 0 }}
              >
                <AccordionSummary
                  aria-controls="panel1a-content"
                  id="panel1a-header"
                  style={{ transition: "none", padding: 0, display: "block" }}
                >
                  <li className={classes.li}>
                    <ListItem>
                      <ListItemIcon className={classes.icon}>
                        <QueuePlayNext />
                      </ListItemIcon>
                      <ListItemText primary={"Campanhas"} />
                    </ListItem>
                  </li>
                </AccordionSummary>
                <AccordionDetails style={{ padding: 0 }}>
                  <div onClick={drawerClose}>
                    <ListItemLink
                      to="/campaigns"
                      primary={"Lista campanhas"}
                      icon={<PhonelinkRing />}
                      style={{ width: "100%", paddingLeft: 20 }}
                    />
                  </div>
                </AccordionDetails>
                <AccordionDetails style={{ padding: 0 }}>
                  <div onClick={drawerClose}>
                    <ListItemLink
                      to="/contactslists"
                      primary={"Lista contatos"}
                      icon={<ListAlt />}
                      style={{ width: "100%", paddingLeft: 20 }}
                    />
                  </div>
                </AccordionDetails>
              </Accordion>
            ) : null}

            {process.env.REACT_APP_MACRO_FUNCTION === "true" ? (
              <div onClick={drawerClose}>
                <ListItemLink
                  to="/macros"
                  primary="Macros"
                  icon={<LoopOutlined />}
                />
              </div>
            ) : null}

            <div onClick={drawerClose}>
              <ListItemLink
                to="/connections"
                primary={i18n.t("mainDrawer.listItems.connections")}
                icon={
                  <Badge
                    badgeContent={connectionWarning ? "!" : 0}
                    color="error"
                  >
                    <SyncAlt />
                  </Badge>
                }
              />
            </div>
            <div onClick={drawerClose}>
              <ListItemLink
                to="/users"
                primary={i18n.t("mainDrawer.listItems.users")}
                icon={<PeopleAltOutlined />}
              />
            </div>
            <div onClick={drawerClose}>
              <ListItemLink
                to="/departaments"
                primary={i18n.t("mainDrawer.listItems.departaments")}
                icon={<DnsOutlined />}
              />
            </div>
            <div onClick={drawerClose}>
              <ListItemLink
                to="/queues"
                primary={i18n.t("mainDrawer.listItems.queues")}
                icon={<AccountTreeOutlined />}
              />
            </div>
            <div onClick={drawerClose}>
              <ListItemLink
                to="/settings"
                primary={i18n.t("mainDrawer.listItems.settings")}
                icon={<SettingsOutlined />}
              />
            </div>
            <Divider className={classes.divider} />
            <ListSubheader inset className={classes.sub}>
              {i18n.t("mainDrawer.listItems.apititle")}
            </ListSubheader>
            <div onClick={drawerClose}>
              <ListItemLink
                to="/api"
                primary={i18n.t("mainDrawer.listItems.api")}
                icon={<Code />}
              />
            </div>
            <div onClick={drawerClose}>
              <ListItemLink
                to="/apidocs"
                primary={i18n.t("mainDrawer.listItems.apidocs")}
                icon={<MenuBook />}
              />
            </div>
            <div onClick={drawerClose}>
              <ListItemLink
                to="/apikey"
                primary={i18n.t("mainDrawer.listItems.apikey")}
                icon={<VpnKeyRounded />}
              />
            </div>
          </>
        )}
      />
      <span className={classes.systemCss}>
        <Link color="inherit" href={system.url}>
          v{systemVersion}
        </Link>
      </span>
    </div>
  );
};

export default MainListItems;
