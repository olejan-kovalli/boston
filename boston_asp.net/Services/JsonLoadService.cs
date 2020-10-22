using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using boston.Models;
using System.IO;
using Newtonsoft.Json;

namespace boston.Services
{
    public class JsonLoadService
    {
        public static Data GetData()
        {
            string JsonFileName = Path.Combine(HttpContext.Current.Request.PhysicalApplicationPath, "App_Data", "data.json");

            string allText = System.IO.File.ReadAllText(JsonFileName);

            Data jsonObject = JsonConvert.DeserializeObject<Data>(allText);
            return jsonObject;
        }
    }
}