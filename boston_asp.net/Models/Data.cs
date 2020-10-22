using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace boston.Models
{
    public class Data
    {
        public string[] feature_names { get; set; }
        public float[][] data { get; set; }
        public float[] target { get; set; }
        public float[] predict { get; set; }
    }
}