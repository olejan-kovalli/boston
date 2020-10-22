using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;
using boston.Models;
using System.Data;
using Newtonsoft.Json;
using System.IO;

using System.Threading.Tasks;

using System.Web.UI.DataVisualization.Charting;
using System.Drawing;
using System.Drawing.Drawing2D;

using boston.Services;

namespace boston
{
    public partial class _Default : Page
    {
        Data data;

        DataTable dt;

        protected void Page_Load(object sender, EventArgs e)
        {
            data = JsonLoadService.GetData();

            CreateTableColumns();
            SetupChart();

            UpdateAllControls();
        }

        private void CreateTableColumns() {
            dt = new DataTable();

            DataColumn dcIndex = new DataColumn("#", typeof(string));

            dt.Columns.Add(dcIndex);

            foreach (string fn in data.feature_names)
            {
                DataColumn dc = new DataColumn(fn, typeof(string));
                dt.Columns.Add(dc);
            }

            DataColumn dcTarget = new DataColumn("Target", typeof(string));
            dt.Columns.Add(dcTarget);

            DataColumn dcPredict = new DataColumn("Predict", typeof(string));
            dt.Columns.Add(dcPredict);
        }

        private void SetupChart()
        {
            Chart1.ChartAreas[0].AxisX.Title = "Predict";
            Chart1.ChartAreas[0].AxisY.Title = "Target";

            Chart1.ChartAreas[0].AxisY.LabelStyle.Format = "{0:0}";
            Chart1.ChartAreas[0].AxisX.LabelStyle.Format = "{0:0}";

            Chart1.Titles.Clear();

            Chart1.Titles.Add(new Title("House prices, $1000", Docking.Top, new Font("Verdana", 8f, FontStyle.Bold), Color.Black));

            Chart1.Series[0] = new Series();
            Chart1.Series[0].ChartType = SeriesChartType.Point;
        }

        public void UpdateTableData()
        {
            dt.Rows.Clear();

            for (int i = 0; i < State.numRowsToShow; i++)
            {
                string[] row = new string[dt.Columns.Count];
                row[0] = (i + 1).ToString();

                for (int j = 0; j < data.data[i].Length; j++)
                {
                    row[j + 1] = data.data[i][j].ToString();
                }

                row[dt.Columns.Count - 2] = data.target[i].ToString();
                row[dt.Columns.Count - 1] = data.predict[i].ToString();

                dt.Rows.Add(row);
            }

            GridView1.DataSource = dt;
            GridView1.DataBind();
        }

        private void UpdateChartData()
        {
            Chart1.Series[0].Points.Clear();
            for (int i = 0; i < State.numRowsToShow; i++)
                Chart1.Series[0].Points.AddXY(data.predict[i], data.target[i]);
        }

        private void UpdateLoadButton()
        {
            LoadButton.Enabled = State.numRowsToShow < data.data.Length;
        }

        private void UpdateLabel()
        {
            InfoLabel.Text = State.numRowsToAdd.ToString() + " rows loaded [" + (State.numRowsToShow - State.numRowsToAdd).ToString() + "-" + State.numRowsToShow.ToString() + "]";

            if (State.numRowsToShow == data.data.Length)
                InfoLabel.Text = "last " + InfoLabel.Text;
        }

        private void UpdateAllControls()
        {
            UpdateTableData();
            UpdateChartData();
            UpdateLoadButton();
            UpdateLabel();
        }

        protected void LoadClick(object sender, EventArgs e)
        {
            State.numRowsToAdd = Math.Min(data.data.Length - State.numRowsToShow, State.numRowsIncrement);
            State.numRowsToShow += State.numRowsToAdd;
            UpdateAllControls();
        }

        protected void ResetClick(object sender, EventArgs e)
        {
            State.numRowsToShow = State.numRowsIncrement;
            State.numRowsToAdd = State.numRowsIncrement;
            UpdateAllControls();
        }
    }
}