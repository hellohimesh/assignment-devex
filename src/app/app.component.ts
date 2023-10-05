import { Component } from '@angular/core';
import { Product, ProductService } from './products.service';
import { Workbook } from 'exceljs';
import saveAs from 'file-saver';
import { exportDataGrid as exportDataGridToPdf } from 'devextreme/pdf_exporter';
import { jsPDF } from 'jspdf';
import { exportDataGrid } from 'devextreme/excel_exporter';
import notify from 'devextreme/ui/notify';

const getOrderDay = function (rowData: any): number {
  return (new Date(rowData.OrderDate)).getDay();
};
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  Products: Product[] = [];
  selectedProduct: Product;
  expanded: Boolean = true;
  customOperations: Array<any>;
  popupPosition: any;

  readonly allowedPageSizes = [5, 10, 'all'];
  showPageSizeSelector = true;

  showInfo = true;
  showNavButtons = true;
  displayMode = 'full';
  selectedTabIndex = 0; 
  addButtonOptions: any;
  deleteButtonOptions: any;
  filterButtonOptions: any;
  showAddPopup: boolean = false;
  chartTitle = 'Sales Opportunity';
  showFilter: boolean = false;
  showEditingPopup: boolean = false;

  constructor(service: ProductService) {
    this.addButtonOptions = {
      text: 'New',
      onClick: () => {
        this.showAddPopup = true;
        notify('New button has been clicked!');
        // this.showEditingPopup = true;
      },
    };
    this.deleteButtonOptions = {
      text: 'Delete',
      // onClick: () => {
      //   notify('Delete button has been clicked!');
      // },
    };
    this.filterButtonOptions = {
      icon: 'filter',
      onClick: () => {
        this.showFilter = true;
      }
    };
    this.customOperations = [{
      name: 'weekends',
      caption: 'Weekends',
      dataTypes: ['date'],
      icon: 'check',
      hasValue: false,
      calculateFilterExpression() {
        return [[getOrderDay, '=', 0], 'or', [getOrderDay, '=', 6]];
      },
    }];
    this.popupPosition = {
      of: window, at: 'top', my: 'top', offset: { y: 10 },
    };
    this.Products = service.getProducts();
    this.selectProduct = this.selectProduct.bind(this);
  }

  selectProduct(e) {
    e.component.byKey(e.currentSelectedRowKeys[0]).done(Product => {
      if(Product) {
        this.selectedProduct = Product;
      }
    });
  }

  exportGrid(e) {
    if (e.format === 'xlsx') {
      const workbook = new Workbook(); 
      const worksheet = workbook.addWorksheet("Main sheet"); 
      exportDataGrid({ 
        worksheet: worksheet, 
        component: e.component,
      }).then(function() {
        workbook.xlsx.writeBuffer().then(function(buffer) { 
          saveAs(new Blob([buffer], { type: "application/octet-stream" }), "DataGrid.xlsx"); 
        }); 
      }); 
      e.cancel = true;
    } 
    else if (e.format === 'pdf') {
      const doc = new jsPDF();
      exportDataGridToPdf({
        jsPDFDocument: doc,
        component: e.component,
      }).then(() => {
        doc.save('DataGrid.pdf');
      });
    }
  }
}
