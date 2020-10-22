<%@ Page Title="Home Page" Language="C#" MasterPageFile="~/Site.Master" AutoEventWireup="true" CodeBehind="Default.aspx.cs" Inherits="boston._Default" %>

<%@ Register Assembly="System.Web.DataVisualization, Version=4.0.0.0, Culture=neutral, PublicKeyToken=31bf3856ad364e35" Namespace="System.Web.UI.DataVisualization.Charting" TagPrefix="asp" %>

<asp:Content ID="BodyContent" ContentPlaceHolderID="MainContent" runat="server">
    <div style="margin-top:10px">
        <asp:Button ID="LoadButton" runat="server" OnClick="LoadClick" Text="Load next 10 rows"/>
        <asp:Label ID="InfoLabel" runat="server" style="margin-left:20px;margin-right:20px"></asp:Label>
        <asp:Button ID="ResetButton" runat="server" OnClick="ResetClick" Text="Reset" />
    </div>
    <div style="height:450px; overflow-y:scroll; border: 1px lightgray solid; width: 100%; min-width:800px; margin-top:10px">
        <asp:GridView ID="GridView1" runat="server" Width="1150px" HorizontalAlign="Justify" GridLines="Horizontal">
            <HeaderStyle  HorizontalAlign="Right" />
        </asp:GridView>
    </div>
    <div style="height:460px; border: 1px lightgray solid; width: 100%; display:flex; justify-content:center; margin-top:10px">
        <asp:Chart runat="server" ID="Chart1" Width="800" Height="450">
            <Series>
                <asp:Series Name="Series1"></asp:Series>
            </Series>
            <ChartAreas>
                <asp:ChartArea Name="ChartArea1"></asp:ChartArea>
            </ChartAreas>
        </asp:Chart>
    </div>
</asp:Content>
