import "./styles.css";
import TabulatorGrid from "./TabulatorGrid";

import React, { useEffect, useState } from "react";

import "tabulator-tables/dist/css/tabulator.min.css";

//import '@fortawesome/fontawesome-free/css/font-awesome.min.css';
import "@fortawesome/fontawesome-free/css/all.css";

import AddToPhotosIcon from "@material-ui/icons/AddToPhotos";

import { Button } from "@material-ui/core";

import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  button: {
    margin: theme.spacing(1)
  }
}));

export default function App() {
  const classes = useStyles();
  const [childTable, setChildTable] = useState(null);

  const [selectedData, setSelectedData] = useState(null);

  function sendTable(table1) {
    setChildTable(table1);
  }

  // function getSelected() {
  //   //table.getSelected();
  //   var selectedData1 = childTable.getSelectedData();
  //   setSelectedData(selectedData1);
  // }
  // getSelected();

  function getdata() {
    let url = "http://localhost:8000/api/product_lists";
    fetch(url).then(function (response) {
      response.text().then(function (text) {
        console.log("data", text);
      });
    });
  }

  return (
    <div align="left">
      <TabulatorGrid sendTable={sendTable} />
      <Button
        variant="contained"
        color="primary"
        size="small"
        
        className={classes.button}
        startIcon={<AddToPhotosIcon />}
      >
        Get Selection from Parent
      </Button>
      <br />
      selected data: {JSON.stringify(selectedData)}
    </div>
  );
}
