import { Component, ViewChild, OnInit, AfterViewInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ModuleRegistry } from '@ag-grid-community/core';  
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { Observable } from 'rxjs';
import { GridOptions } from "@ag-grid-community/all-modules";
import { DataService } from './_services/data.service';

ModuleRegistry.registerModules([
  ClientSideRowModelModule
]);

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, AfterViewInit {
  title = 'boston';

  @ViewChild('table') table;
  //@ViewChild('plot') plot;

  numRowsIncrement = 10;
  numRowsToShow = 0;
  numRowsAdded = this.numRowsIncrement;

  columnDefs: any;
  //fullRowData: any;
  rowData: any;
  gridOptions: any;
  
  plotData: any;
  plotLayout: any;
  plotConfig:any;

  message: any;
  lastRowLoaded = false;  

  selectedNodes: any;

  data: any;
  
  constructor(private http: HttpClient,private dataServ: DataService) {    
    this.gridOptions = <GridOptions>{
      onGridReady: () => {
        this.gridOptions.api.sizeColumnsToFit();
      }
    }  
    
    this.plotConfig = {
      "modeBarButtonsToRemove": [ 
        'select2d', 
        'lasso2d', 
        'toggleSpikelines', 
        'hoverCompareCartesian'
      ]};

    this.plotLayout = {      
      height: 450,            
      title: {
        text: '<b>House prices, $1000</b>'
      },       
      xaxis:{ 
        title: 'Predict',        
      },      
      yaxis: { 
        title: 'Target',
        //scaleanchor:"x", 
        //scaleratio:1,     
      },
      autosize: false,
      showlegend: false
    }
  }

  ngOnInit(): void {
    this.dataServ.getData().subscribe(data => {    
      this.data = data;
      this.defineColumns(data);
      this.rowData = [];
      this.numRowsToShow = this.numRowsIncrement;
      this.updateDisplayedData();    
    });
  }

  ngAfterViewInit(): void {
    if (this.gridOptions && this.gridOptions.api)
      this.gridOptions.api.sizeColumnsToFit();
  }

  defineColumns(data) {
    this.columnDefs = [];

    var indColWidth = 70;
    var colWidth = 90;

    this.columnDefs.push({ headerName: '#', valueGetter: "node.rowIndex + 1", width: indColWidth, minWidth: indColWidth, cellStyle: {fontWeight: 'bold'} });      

    for(const colName of data['feature_names'])
      this.columnDefs.push({ field: colName, minWidth: colWidth});
  
    this.columnDefs.push({  headerName: 'Target', field: 'target', minWidth: colWidth});
    this.columnDefs.push({  headerName: 'Predict', field: 'predict', minWidth: colWidth, valueFormatter: this.fixedFormatter});

    this.columnDefs.forEach(col => {
      col['resizable'] = true;
      col['type'] = 'rightAligned';
    });
  }

  fixedFormatter(params) {
    var absVal = Math.abs(params.value);
    if (Math.abs(absVal - Math.round(absVal)) >= 0.05)
      return params.value.toFixed(1);
    else
      return params.value.toFixed();
  }

  updateDisplayedData() {   
    for (var i = this.rowData.length; i < this.numRowsToShow; i++) {   
      var row = {};
      
      for (var j = 0; j < this.data.feature_names.length; j++)
        row[this.data['feature_names'][j]] = this.data['data'][i][j];

      row['target'] = this.data['target'][i];
      row['predict'] = this.data['predict'][i];

      this.rowData.push(row);   
    } 
    
    if (this.table)
      this.table.api.setRowData(this.rowData);

    this.updatePlotData();

    this.message = `${this.numRowsAdded} rows loaded [${this.numRowsToShow - this.numRowsAdded + 1}-${this.numRowsToShow}]`;

    if(this.numRowsToShow == this.data['data'].length){
      this.lastRowLoaded = true;
      this.message = `last ${this.message}`
    }  
  }

  loadClick() {    
    this.numRowsToShow = Math.min(this.numRowsToShow + 10, this.data['data'].length);
    this.numRowsAdded = this.numRowsToShow - this.rowData.length;
    this.updateDisplayedData();

    if (this.gridOptions && this.gridOptions.api)
      this.gridOptions.api.sizeColumnsToFit();
  }

  deselectClick() {        
    this.gridOptions.api.getSelectedNodes().forEach(node => {
      node.setSelected(false);      
    });
    this.selectedNodes = [];
  }

  handleRowDataChanged(event) {
    const index = this.rowData.length - 1;
    this.gridOptions.api.ensureIndexVisible(index, 'bottom');    
        
    if(this.rowData) {
      this.gridOptions.api.forEachNode((node) => {      
        if (node.childIndex >= this.rowData.length - this.numRowsAdded)
          node.setSelected(true);      
        else
          node.setSelected(false);      
      });
    }

    this.selectedNodes = this.gridOptions.api.getSelectedNodes();
  }

  rowSelected(event){  
    this.updatePlotData();
    this.selectedNodes = this.gridOptions.api.getSelectedNodes();
  }

  onResized(event){    
    if (this.gridOptions && this.gridOptions.api)
      this.gridOptions.api.sizeColumnsToFit();

    this.plotLayout['width'] = event.newWidth;
  }

  updatePlotData() {
    this.plotData = [];
    
    var selectedIndices = this.gridOptions.api.getSelectedNodes().map(sn => sn.childIndex);
    var allIndices = Array.from(Array(this.numRowsToShow).keys());
    var deselectedIndices = allIndices.filter(i => !selectedIndices.includes(i));

    var x = this.data['predict'].slice(0, this.numRowsToShow);
    var y = this.data['target'].slice(0, this.numRowsToShow);

    var x1 = deselectedIndices.map(i => x[i]);
    var y1 = deselectedIndices.map(i => y[i]);    

    this.plotData.push({name:'', x: x1, y: y1, mode: 'markers', marker:{color:'#1F77B4'}});

    var x2 = selectedIndices.map(i => x[i]);
    var y2 = selectedIndices.map(i => y[i]);    
    
    this.plotData.push({name:'', x: x2, y: y2, mode: 'markers', marker:{size:10, color:'#19D3F3'}});
  }
}

