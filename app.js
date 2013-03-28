(function(win){
  var dataset_id, dataset, info_ready, summary_ready, schema, exclude_list;

  exclude_list = ["name"];
  dataset_id = '3a18780972da435e8c7e345b34bfcd65';// students
  dataset_id = 'eaa43ef6baa54af4948303fd093d9756'; //expenses
  dataset_id = '890c9e48f0154197be128bf07ce08dee'; // dadaab
  //dataset_id = '7d30227a371e407f949559c46720ae82'; // tutorial_sdf
  // set URL to localhost
  //bamboo.settings.URL = "http://localhost:8080/";
  dataset = new bamboo.Dataset({id: dataset_id});

  info_ready = function(info){
    schema = info.schema;
    dataset.summary("all", null, summary_ready);
  };
  
  summary_ready = function(summaries){
    var elm_id_index = 0;
    _.each(schema, function(field, id){
      if(summaries.hasOwnProperty(id) && (typeof(exclude_list) == "undefined" || (typeof(exclude_list) != "undefined" && !_.contains(exclude_list, id)))){
        var chart_factory;
        // determine the chart factory
        if(field.olap_type == "measure")
        {
          console.info("Found chart factory 'chart_factory' for " + id);
          chart_factory = line_graph_factory;
        }
        else if(field.olap_type == "dimension")
        {
          if(field.simpletype != 'list' && !summaries[id].hasOwnProperty('mean'))
          {
            chart_factory = pie_chart_factory;
            console.info("Found chart factory 'pie_chart_factory' for " + id)
          }
          else if (field.simpletype == 'list')
          {
            console.info("Skipped charting " + id + ", implement a chart factory for lists.")
          }
          else
          {
            console.warn("Dont know what to do with '" + id + "' with olap_type: " + field.olap_type + " and simpletype: " + field.simpletype);
          }
        }
        else
        {
          console.warn("Couldn't find an appropriate chart factory for " + id + " with olap_type: " + field.olap_type + " and simpletype: " + field.simpletype);
        }

        if(chart_factory)
        {
          var chart_container, title_elm, chart_elm, chart_elm_id, context, chart, data, raphael, chart, summary;
          // create html container
          chart_container = $('<div>').addClass('span12').addClass('raphael-container');
          chart_elm_id = 'chart-' + (++elm_id_index);
          chart_elm = $('<div>').attr('width', 600).attr('height', 400).attr('id', chart_elm_id);
          chart_container.append(chart_elm);
          $('#charts').append(chart_container);
          raphael = Raphael(chart_elm_id);
          chart_factory.call(field, raphael, summaries[id].summary);
        }
        
      }
    });
  };

  line_graph_factory = function(r, summary){
    var x_axis = [], y_axis = [];
    _.each({"25%": 25, "50%": 50, "75%": 50}, function(val, key)
    {
      x_axis.push(val);
      y_axis.push(parseFloat(summary[key]));
    });
    r.text(200, 10, this.label).attr({ font: "20px sans-serif" });
    var lines = r.linechart(20, 20, 500, 300, x_axis, y_axis, { nostroke: false, axis: "0 0 1 1", symbol: "circle", smooth: true }).hoverColumn(function () {
                        this.tags = r.set();

                        for (var i = 0, ii = this.y.length; i < ii; i++) {
                            this.tags.push(r.tag(this.x, this.y[i], this.values[i], 160, 10).insertBefore(this).attr([{ fill: "#fff" }, { fill: this.symbols[i].attr("fill") }]));
                        }
                    }, function () {
                        this.tags && this.tags.remove();
                    });
  };

  pie_chart_factory = function(raphael, summary){
    var pie_chart_data = [], pie_chart_labels = [];
    // build pie chart data
    _.each(summary, function(value, label){
      pie_chart_data.push(value);
      pie_chart_labels.push(label + ' [' + value + ']');
    });
    
    raphael.text(200, 10, this.label).attr({ font: "20px sans-serif" });
    chart = raphael.piechart(300, 200, 120, pie_chart_data,
      {legend: pie_chart_labels, legendpos: "east", href: ["http://raphaeljs.com", "http://g.raphaeljs.com"]});
    chart.hover(function () {
      this.sector.stop();
      this.sector.scale(1.1, 1.1, this.cx, this.cy);

      if (this.label) {
        this.label[0].stop();
        this.label[0].attr({ r: 7.5 });
        this.label[1].attr({ "font-weight": 800 });
      }
    }, function () {
      this.sector.animate({ transform: 's1 1 ' + this.cx + ' ' + this.cy }, 500, "bounce");

      if (this.label) {
        this.label[0].animate({ r: 5 }, 500, "bounce");
        this.label[1].attr({ "font-weight": 400 });
      }
    });
  };

  // callback when summary has been loaded
  summary_ready_bac = function(summaries){
    var temp_colors = ['#F38630', '#E0E4CC', '#69D2E7', '#4D5360', '#949FB1', '#D4CCC5', '#E2EAE9', '#F7464A'];
    var index = 0;
    _.each(dimensions, function(field, field_name){
      if(summaries.hasOwnProperty(field_name) && (typeof(exclude_list) == "undefined" || (typeof(exclude_list) != "undefined" && !_.contains(exclude_list, field_name))))
      {
        // create a canvas object
        var chart_container, title_elm, chart_elm, chart_elm_id, context, chart, data, raphael, chart;

        chart_container = $('<div>').addClass('span12').addClass('raphael-container');
        //title_elm = $('<h2>').html(field.label);
        //chart_container.append(title_elm);
        chart_elm_id = 'chart' + (++index);
        chart_elm = $('<div>').attr('width', 600).attr('height', 400).attr('id', chart_elm_id);
        chart_container.append(chart_elm);
        $('#charts').append(chart_container);
        // generate data
        data = [];
        var temp_color_index = 0;
        // make sure we have a summary object for field_name
        _.each(summaries[field_name].summary, function(value, label){
          data.push({value: value, label: label + ' [' + value + ']'});
        });
        raphael_data = _.map(data, function(item){
          return item.value;
        });
        legend_labels = _.map(data, function(item){
          return item.label;
        });
        // create raphael object
        raphael = Raphael(chart_elm_id);
        raphael.text(200, 10, field.label).attr({ font: "20px sans-serif" });
        chart = raphael.piechart(300, 200, 120, raphael_data,
          {legend: legend_labels, legendpos: "east", href: ["http://raphaeljs.com", "http://g.raphaeljs.com"]});
        chart.hover(function () {
          this.sector.stop();
          this.sector.scale(1.1, 1.1, this.cx, this.cy);

          if (this.label) {
            this.label[0].stop();
            this.label[0].attr({ r: 7.5 });
            this.label[1].attr({ "font-weight": 800 });
          }
        }, function () {
          this.sector.animate({ transform: 's1 1 ' + this.cx + ' ' + this.cy }, 500, "bounce");

          if (this.label) {
            this.label[0].animate({ r: 5 }, 500, "bounce");
            this.label[1].attr({ "font-weight": 400 });
          }
        });
      }
    });
  };
  
  // how deferred could work
  // var deferred = dataset.info();
  // deferred.done(info_ready).summary('all', null).done(summary_ready);

  dataset.query_info(info_ready);
})(this);