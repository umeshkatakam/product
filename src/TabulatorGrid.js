import React, { useEffect, useState } from "react";

import Tabulator from "tabulator-tables";
import "tabulator-tables/dist/css/tabulator.min.css";

//import '@fortawesome/fontawesome-free/css/font-awesome.min.css';
import "@fortawesome/fontawesome-free/css/all.css";

import AddCircleIcon from "@material-ui/icons/AddCircle";
import SaveIcon from "@material-ui/icons/Save";
import AddToPhotosIcon from "@material-ui/icons/AddToPhotos";

import { Button } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import productService from "./productService";
const useStyles = makeStyles((theme) => ({
  button: {
    margin: theme.spacing(1)
  }
}));

// Entire functionality in one file.
// Tabulator component, without ReactTabular
// Date: Nov-15-2020
// Bhavani P Polimetla

function TabulatorGrid(props) {
  const classes = useStyles();
  //https://blog.bitsrc.io/react-useref-and-react-createref-the-difference-afedb9877d0f
  let refTable = React.useRef();
  const [table, setTable] = useState(null);

  const [columnsList, setColumnsList] = useState(null);

  const [productList, setProductList] = useState(null);
  const [productListInitial, setProductListInitial] = useState(null);
  const [finalProductList, setFinalProductList] = useState(null);

  const [displayRecord, setDisplayRecord] = useState(0); //Display this record

  const [isBusy, setIsBusy] = useState(true);
  const [isSaved, setIsSaved] = useState(true); //Display save message

  const [recCounter, setRecCounter] = useState(-1); //New id for new records

  const [selectedData, setSelectedData] = useState(null);
  var viewIcon = function (cell, formatterParams, onRendered) {
    //plain text value
    return "<i class='fas fa-eye fa-lg' style='color:blue'></i> View";
  };

  var deleteIcon = function (cell, formatterParams, onRendered) {
    //plain text value
    return "<i class='far fa-trash-alt fa-lg' style='color:red'></i> Delete";
  };

  const columns = [
    {
      formatter: "rowSelection",
      titleFormatter: "rowSelection",
      hozAlign: "center",
      headerSort: false,
      cellClick: function (e, cell) {
        cell.getRow().toggleSelect();

        var selectedData1 = table.getSelectedData();
        setSelectedData(selectedData1);

        console.log("examid:");
      }
    },
    { title: "ID", field: "id", width: 50, sorter: "number" },
    {
      title: "View",
      field: "passed",
      align: "center",
      formatter: viewIcon,
      cellClick: function (e, cell) {
        console.log("view=>" + cell.getRow().getData().id);
        setDisplayRecord(cell.getRow().getData().id);
      }
    },
    {
      title: "Product",
      field: "product",
      hozAlign: "left",
      editor: true,
      headerFilter: "input"
    },
    { title: "Price", field: "price", hozAlign: "left" },
    { title: "Quantity", field: "quantity" },
    {
      title: "Availability",
      field: "availability",
      editor: "select",
      editorParams: { values: ["Enable", "Disable"] },
      headerFilter: true,
      headerFilterParams: {
        values: { Enable: "Enable", Disable: "Disable", "": "" }
      }
    },
    {
      title: "Delete",
      field: "passed",
      align: "center",
      formatter: deleteIcon,
      cellClick: function (e, cell) {
        console.log("delete=>" + cell.getRow().getData().id);
        cell.getRow().delete();
      }
    }
  ];

  var list1 = [
    {
      id: 1,
      price: 2,
      quantity: 6,
      product: "Apples",
      availability: "Enable"
    },
    {
      id: 2,
      price: 2,
      quantity: 2,
      product: "Oranges",
      availability: "Enable"
    },
    {
      id: 3,
      price: 1,
      quantity: 2,
      product: "Bananas",
      availability: "Enable"
    },
    {
      id: 4,
      price: 5,
      quantity: 1,
      product: "Strawberry",
      availability: "Disable"
    }
  ];

  useEffect(() => {
    setProductList(list1);
    setProductListInitial(JSON.parse(JSON.stringify(list1))); //Deep copy
    setColumnsList(columns);

    var table1 = new Tabulator(refTable, {
      layout: "fitDataTable",
      data: list1,
      reactiveData: true,
      columns: columns,
      dataChanged: function (newData) {
        console.log("dataEdited:", newData);
        setProductList(newData);
      },
      pagination: "local",
      paginationSize: 5,
      paginationSizeSelector: [5, 10, 15, 20]
    });
    setTable(table1);

    if (typeof props.sendTable === "function") {
      props.sendTable(table1);
    }

    setIsBusy(false);
  }, []);

  function getSelected() {
    //table.getSelected();
    var selectedData1 = table.getSelectedData();
    setSelectedData(selectedData1);
  }

  const saveAll = () => {
    //console.log("Save All ==>"+JSON.stringify(productList));

    //Step 1 - Convert array of objects to array of strings
    let newList = [];
    if (null != productList) {
      for (let i = 0; i < productList.length; i++) {
        newList.push(JSON.stringify(productList[i]));
      }
    }

    //Step 2 - Convert array of objects to array of strings
    let oldList = [];
    if (null != productListInitial) {
      for (let i = 0; i < productListInitial.length; i++) {
        oldList.push(JSON.stringify(productListInitial[i]));
      }
    }
    //console.log("newList ==>"+JSON.stringify(newList));
    //console.log("oldList ==>"+JSON.stringify(oldList));

    //Step 3 - Items to add/modify/delete
    let insertList = newList.filter((x) => !oldList.includes(x));
    let deleteList = oldList.filter((x) => !newList.includes(x));
    let modifyObjects = [];

    //console.log("difference1 (Insert/Modify) ==>"+JSON.stringify(insertList));
    //console.log("difference2 (Remove/Modify) ==>"+JSON.stringify(deleteList));

    //Step 4 - Bring objects back for further  process
    let insertObjects = [];
    let deleteObjects = [];

    if (null != insertList) {
      for (let i = 0; i < insertList.length; i++) {
        insertObjects.push(JSON.parse(insertList[i]));
      }
    }

    if (null != deleteList) {
      for (let i = 0; i < deleteList.length; i++) {
        deleteObjects.push(JSON.parse(deleteList[i]));
      }
    }

    //Step 5 - find intersection of IDs
    let insertArray = [];
    let deleteArray = [];

    insertObjects.forEach((item) => {
      insertArray.push(item.id);
    });
    deleteObjects.forEach((item) => {
      deleteArray.push(item.id);
    });

    insertObjects.forEach(function (obj) {
      console.log("insert=>" + obj.id);
    });

    //console.log("insertArray=>"+insertArray.toString());
    //console.log("deleteArray=>"+deleteArray.toString());

    let intersectionArray = [];
    intersectionArray = insertArray.filter((value) =>
      deleteArray.includes(value)
    );
    //console.log("intersectionArray=>"+intersectionArray.toString());

    //Step 6 - For intersection ids,
    // a) remove id from insert list,
    // b) remove from delete list and add to modify list.
    if (
      typeof intersectionArray !== "undefined" &&
      intersectionArray.length > 0
    ) {
      let modifyObjectsNew = [];
      //a) remove id from insert list,
      let insertObjectsNew = [];
      if (null != insertObjects) {
        for (let i = 0; i < insertObjects.length; i++) {
          if (!intersectionArray.includes(insertObjects[i].id)) {
            insertObjectsNew.push(insertObjects[i]);
            //console.log("inserting==>"+insertObjects[i]);
          } else {
            modifyObjectsNew.push(insertObjects[i]);
          }
        }

        insertObjects = JSON.parse(JSON.stringify(insertObjectsNew));
      }

      // b) remove from delete list and add to modify list.
      let deleteObjectsNew = [];

      if (null != deleteObjects) {
        for (let i = 0; i < deleteObjects.length; i++) {
          if (!intersectionArray.includes(deleteObjects[i].id)) {
            deleteObjectsNew.push(deleteObjects[i]);
          } //else {
          //modifyObjectsNew.push(deleteObjects[i]);
          //}
        }

        deleteObjects = JSON.parse(JSON.stringify(deleteObjectsNew));
        modifyObjects = JSON.parse(JSON.stringify(modifyObjectsNew));
      }
    } //end of if condition

    const finalList = {
      INSERT: insertObjects,
      MODIFY: modifyObjects,
      DELETE: deleteObjects
    };
    console.log("final list2:" + JSON.stringify(finalList));
    setFinalProductList(finalList);

    console.log("=====================");
    setIsSaved(true);
  };

  //Add new record
  function addNewRow() {
    console.log("Add new row");
    var rec1 = {
      id: recCounter,
      price: 1,
      quantity: 2,
      product: "Fruit " + recCounter,
      availability: "Disable"
    };

    setRecCounter(recCounter - 1);

    //console.log("After adding row=>" + JSON.stringify(productList));
    table.addRow(rec1);
  }

  return (
    <div>
      <div>
        <div className="foo" ref={(el) => (refTable = el)} />
      </div>
      <Button
        variant="contained"
        color="primary"
        size="small"
        onClick={addNewRow}
        className={classes.button}
        startIcon={<AddCircleIcon />}
      >
        Add Product
      </Button>
      <Button
        variant="contained"
        color="primary"
        size="small"
        onClick={saveAll}
        className={classes.button}
        startIcon={<SaveIcon />}
      >
        Save
      </Button>
      <Button
        variant="contained"
        color="primary"
        size="small"
        onClick={getSelected}
        className={classes.button}
        startIcon={<AddToPhotosIcon />}
      >
        Get Selection
      </Button>
      {!isSaved && "Unsaved Changes"}
      <br />
      Display Product Details: {displayRecord}
      <br />
      selected data: {JSON.stringify(selectedData)}
      <br />
      Final Product List:
      {finalProductList === null ? (
        <div> Nothing to save </div>
      ) : (
        <div>
          Insert: {JSON.stringify(finalProductList.INSERT)}
          <br /> Modify: {JSON.stringify(finalProductList.MODIFY)}
          <br /> Delete: {JSON.stringify(finalProductList.DELETE)}
        </div>
      )}
      <br />
      Note: Send this to Services/DB to store
    </div>
  );
}

export default TabulatorGrid;
