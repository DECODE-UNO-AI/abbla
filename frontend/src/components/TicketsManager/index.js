import React, { useContext, useEffect, useState } from "react";

import { 
  Badge,
  Button,
  FormControlLabel,
  makeStyles,
  Paper,
  Tab,
  Tabs,
  Switch,
  InputLabel
} from "@material-ui/core";

import {
  AllInboxRounded,
  HourglassEmptyRounded,
  MoveToInbox,
  Search
} from "@material-ui/icons";

import NewTicketModal from "../NewTicketModal";
import TicketsList from "../TicketsList";
import TabPanel from "../TabPanel";
import FilterComponent from "../FilterComponent";
import { TagsFilter } from "../TagsFilter";
import { Can } from "../Can";
import TicketsQueueSelect from "../TicketsQueueSelect";
// import useQueues from "../../hooks/useQueues";



import { i18n } from "../../translate/i18n";
import { AuthContext } from "../../context/Auth/AuthContext";

const useStyles = makeStyles((theme) => ({
  ticketsWrapper: {
    position: "relative",
    display: "flex",
    height: "100%",
    flexDirection: "column",
    overflow: "auto",
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
  },

  tabsHeader: {
    flex: "none",
    backgroundColor: theme.palette.background.default,
  },

  settingsIcon: {
    alignSelf: "center",
    marginLeft: "auto",
    padding: 8,
  },

  tab: {
    minWidth: 120,
    width: 120,
  },

  ticketOptionsBox: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: theme.palette.background.paper,
    padding: theme.spacing(1),
  },

  serachInputWrapper: {
    flex: 1,
    backgroundColor: theme.palette.background.default,
    display: "flex",
    borderRadius: 40,
    padding: 4,
    marginRight: theme.spacing(1),
  },

  searchIcon: {
    color: theme.palette.primary.main,
    marginLeft: 6,
    marginRight: 6,
    alignSelf: "center",
  },

  searchInput: {
    flex: 1,
    border: "none",
    borderRadius: 25,
    padding: "10px",
    outline: "none",
  },

  badge: {
    right: 0,
  },
  show: {
    display: "block",
  },
  hide: {
    display: "none !important",
  },
  searchContainer: {
    display: "flex",
    padding: "10px",
    borderBottom: "2px solid rgba(0, 0, 0, .12)",
  },
}));

const TicketsManager = () => {
  const classes = useStyles();

  const [searchParam, setSearchParam] = useState("");
  const [tab, setTab] = useState("open");
  const [tabOpen] = useState("open");
  const [newTicketModalOpen, setNewTicketModalOpen] = useState(false);
  const [showAllTickets, setShowAllTickets] = useState(false);
  const { user } = useContext(AuthContext);

  const [OpenCount, setOpenCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [selectedTags, setSelectedTags] = useState([]);
  const [tagsId, setTagsId] = useState([])

  const userQueueIds = user?.queues?.map((q) => q.id);
  const [selectedQueueIds, setSelectedQueueIds] = useState(userQueueIds || []);


  const [adminFilterOptions, setAdminFilterOptions] = useState({})

  useEffect(() => {
    if (user?.profile.toUpperCase() === "ADMIN") {
      setShowAllTickets(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])


  const handleSearch = (e) => {
    const searchedTerm = e.target.value.toLowerCase();


    setSearchParam(searchedTerm);
    if (searchedTerm === "") {
      setTab("open");
    } else if (tab !== "search") {
      setTab("search");
    }

  };

  const handleChangeTab = (e, newValue) => {
    setTab(newValue);
  };

  const applyPanelStyle = (status) => {
    if (tabOpen !== status) {
      return { width: 0, height: 0 };
    }
  };

  const handleOnFilterSubmit = (value) => {
    setAdminFilterOptions(value)
  }

  const handleOnUserSelectTags = (e) => {
    const tags = e.map(tag => tag.id)
    setTagsId(tags)
    setSelectedTags(e)
  }

  return (
    <Paper elevation={0} variant="outlined" className={classes.ticketsWrapper}>
      <NewTicketModal
        modalOpen={newTicketModalOpen}
        onClose={(e) => setNewTicketModalOpen(false)}
      />
      <Paper elevation={0} square className={classes.searchContainer}>
        <Search className={classes.searchIcon} />
        <input
          type="text"
          placeholder={i18n.t("tickets.search.placeholder")}
          className={classes.searchInput}
          value={searchParam}
          onChange={handleSearch}
        />  
        {user?.profile === "admin" || user?.profile === 'supervisor' ? 
          <FilterComponent user={user} onSubmit={handleOnFilterSubmit} status={tab}/>
          :
          ""
        }
      </Paper>
      <Paper elevation={0} square className={classes.tabsHeader}>
        <Tabs
          value={tab}
          onChange={handleChangeTab}
          variant="fullWidth"
          indicatorColor="primary"
          textColor="primary"
          aria-label="icon label tabs example"
        >
          <Tab
            value={"open"}
            icon={<MoveToInbox />}
            label={i18n.t("tickets.tabs.open.title")}
            classes={{ root: classes.tab }}
          />
          <Tab
            value={"pending"}
            icon={<HourglassEmptyRounded />}
            label={
              <Badge
                className={classes.badge}
                badgeContent={pendingCount}
                color="secondary"
              >
                {i18n.t("ticketsList.pendingHeader")}
              </Badge>
            }
            classes={{ root: classes.tab }}
          />
          <Tab
            value={"closed"}
            icon={<AllInboxRounded />}
            label={i18n.t("tickets.tabs.closed.title")}
            classes={{ root: classes.tab }}
          />
        </Tabs>
      </Paper>
      <Paper square elevation={0} className={classes.ticketOptionsBox}>
        <div style={{ flex: 1}}>
          <Button
            variant="outlined"
            color="primary"
            onClick={() => setNewTicketModalOpen(true)}
          >
            {i18n.t("ticketsManager.buttons.newTicket")}
          </Button>
        </div>
        <div style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center"}}>
          <Can
            role={user.profile}
            perform="tickets-manager:showall"
            yes={() => (
              <FormControlLabel
                label={i18n.t("tickets.buttons.showAll")}
                labelPlacement="start"
                control={
                  <Switch
                    size="small"
                    checked={showAllTickets}
                    onChange={() =>
                      setShowAllTickets((prevState) => !prevState)
                    }
                    name="showAllTickets"
                    color="primary"
                  />
                }
              />
            )}
          />
        </div>
        {user?.profile === 'admin' || user?.profile === 'supervisor' ?
          (
            tab === "open" || tab === "pending"?
            <div  style={{ flex: 1, display: "flex", justifyContent: "end" }}>
              <InputLabel>Tickets: {tab === "open" ? OpenCount : pendingCount}</InputLabel>
            </div>
            :
            <div  style={{ flex: 1 }} />
          )
        :
        <TicketsQueueSelect
          style={{ marginLeft: 6 }}
          selectedQueueIds={selectedQueueIds}
          userQueues={user?.queues}
          onChange={(values) => setSelectedQueueIds(values)}
        />
        }

      </Paper>
      <TabPanel value={tab} name="open" className={classes.ticketsWrapper}>
      {user?.profile === "user" ?
        <TagsFilter onFiltered={handleOnUserSelectTags} selecteds={selectedTags} setSelecteds={setSelectedTags}/>
        :
        ""
      }
        <Paper className={classes.ticketsWrapper}>
          <TicketsList
            status="open"
            showAll={showAllTickets}
            selectedQueueIds={selectedQueueIds}
            updateCount={setOpenCount}
            style={applyPanelStyle("open")}
            adminFilterOptions={adminFilterOptions}
            selectedTags={tagsId}
          />
          <TicketsList
            status="pending"
            updateCount={setPendingCount}
            selectedQueueIds={selectedQueueIds}
            showAll={showAllTickets}
            style={applyPanelStyle("pending")}
            adminFilterOptions={adminFilterOptions}
            selectedTags={tagsId}
          />
        </Paper>
      </TabPanel>

      <TabPanel value={tab} name="pending" className={classes.ticketsWrapper}>
      {user?.profile === "user" ?
        <TagsFilter onFiltered={handleOnUserSelectTags} selecteds={selectedTags} setSelecteds={setSelectedTags}/>
        :
        ""
      }
        <TicketsList
          status="pending"
          showAll={true}
          updateCount={setPendingCount}
          selectedQueueIds={selectedQueueIds}
          adminFilterOptions={adminFilterOptions}
          selectedTags={tagsId}
        />
      </TabPanel>



      <TabPanel value={tab} name="closed" className={classes.ticketsWrapper}>
      {user?.profile === "user" ?
        <TagsFilter onFiltered={handleOnUserSelectTags} selecteds={selectedTags} setSelecteds={setSelectedTags}/>
        :
        ""
      }
        <TicketsList
          status="closed"
          showAll={true}
          selectedQueueIds={selectedQueueIds}
          adminFilterOptions={adminFilterOptions}
          selectedTags={tagsId}
        />
      </TabPanel>
      <TabPanel value={tab} name="search" className={classes.ticketsWrapper}>
      {/* <TagsFilter onFiltered={handleSelectedTags} /> */}
        <TicketsList
          searchParam={searchParam}
          tags={selectedTags}
          showAll={true}
          selectedQueueIds={selectedQueueIds}
          adminFilterOptions={adminFilterOptions}
        />
      </TabPanel>
    </Paper>
  );
};

export default TicketsManager;