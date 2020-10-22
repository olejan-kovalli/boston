import dash
import dash_core_components as dcc
import dash_html_components as html
import plotly.express as px
import pandas as pd
import json
import dash_table
from dash.dependencies import Input, Output
from dash_table.Format import Format, Scheme
import os

data_file = os.path.join(os.path.dirname(os.path.realpath(__file__)), "data.json")
    
with open(data_file, 'r') as f:
    data = json.load(f)
          
df = pd.DataFrame(columns=data['feature_names'], data = data['data'])
df = df.reset_index()
df['index'] = df['index'] + 1
df['Target'] = data['target']
df['Predict'] = data['predict']

external_stylesheets = ['https://codepen.io/chriddyp/pen/bWLwgP.css']

app = dash.Dash(__name__, external_stylesheets=external_stylesheets)

server = app.server

num_displayed_rows = 0

fig = px.scatter(df[:num_displayed_rows], x="Predict", y="Target")

app.layout = html.Div(children=[
    html.H1(children='Boston linear regression test'),

    html.Div(children=['For more details refer to ',
                       html.A('Boston house prices dataset on scikit-learn.org', 
                              href="https://scikit-learn.org/stable/datasets/index.html#boston-dataset", 
                              target="_blank"), '.']),
    html.P(),    
    html.Div(id="control-div", 
             children=[
                html.Button("Load next 10 rows", id="load-btn", n_clicks=0),
                html.Div(id='message-div',children='to be defined in callback', style={'margin-left':'20px', 'margin-top':'8px'})],
            style={'display':'flex'}),        
    html.P(),
    
    html.Div(children=dash_table.DataTable(id="table",
                data = df[:num_displayed_rows].to_dict('records'),        
                columns=[{'id': c, 'name': c, 'type': 'numeric', 'format':Format(precision=5)} for c in df.columns],
                page_action='none',
                fixed_rows={'headers': True},               
                style_table={'height': '331px', 'overflowY': 'auto'},
                style_data = {'minWidth':'50px'}),
            style={'border':'1px solid lightgray'}),
        
    html.P(),
    
    html.Div(children=dcc.Graph(id='graph', figure=fig),
             style={'border':'1px solid lightgray'}),
    
    html.Div(id="numrows-container-hidden-div", 
             children=html.Div(id='numrows-hidden-div', style={'display': 'none'}, children=num_displayed_rows)),
    html.Div(id='data-hidden-div', style={'display': 'none'}, children=df.to_json()),    
])

@app.callback([Output("table", 'data'), 
               Output("graph", 'figure'), 
               Output("numrows-container-hidden-div", 'children'), 
               Output("message-div", 'children'),
               Output('load-btn', 'disabled'), 
               Output('load-btn', 'style'), ], 
              [Input('load-btn', 'n_clicks'), 
               Input('data-hidden-div', 'children'), 
               Input("numrows-hidden-div", 'children')] )
def update_output(n, jsonified_data, num_displayed_rows):
    df = pd.read_json(jsonified_data)
    df = df.sort_index()
        
    num_rows_inc = 10
        
    num_rows_to_show = min(len(df), num_displayed_rows + num_rows_inc)    
    
    num_rows_added = num_rows_to_show - num_displayed_rows
    
    data = df[:num_rows_to_show].to_dict('records')
    
    fig = px.scatter(df[:num_rows_to_show], x="Predict", y="Target")
    
    fig.update_layout(title={'text':'House prices, $1000','x':0.5,'xanchor': 'center'})
        
    disabled = False
    btn_style = {'background-color':'#0275d8', 'color':'white'}
    
    if (num_displayed_rows < len(df)):
        message = str(num_rows_added) + ' rows loaded [' + str(num_displayed_rows) + '-' + str(num_rows_to_show) +']'
        if (num_rows_to_show == len(df)):
            message = 'last ' + message                    
            disabled = True
            btn_style = {'background-color':'lightgray', 'color':'gray'}               
    
    return [data,
            fig,
            html.Div(id='numrows-hidden-div', style={'display': 'none'}, children=num_rows_to_show),
            message,
            disabled,
            btn_style]
            
    
if __name__ == '__main__':
    app.run_server(debug=True)