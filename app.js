(function(win){
  var dataset_id, dataset, info_ready, summary_ready, dimensions, exclude_list;

  exclude_list = ["name"];
  dataset_id = '3a18780972da435e8c7e345b34bfcd65';// students
  dataset_id = 'eaa43ef6baa54af4948303fd093d9756'; //expenses
  //dataset_id = '890c9e48f0154197be128bf07ce08dee';
  dataset = new bamboo.Dataset({id: dataset_id});

  info_ready = function(info){
    // get all fields where olap_type is dimension
    dimensions = {};
    _.each(info.schema, function(field, key){
      if(arguments[0].olap_type == "dimension")
      {
        dimensions[key] = field;
      }
    });
    dataset.summary("all", null, summary_ready);
  };

  // callback when summary has been loaded
  summary_ready = function(summaries){
    var temp_colors = ['#F38630', '#E0E4CC', '#69D2E7', '#4D5360', '#949FB1', '#D4CCC5', '#E2EAE9', '#F7464A'];
    var index = 0;
    _.each(dimensions, function(field, field_name){
      if(typeof(exclude_list) == "undefined" || (typeof(exclude_list) != "undefined" && !_.contains(exclude_list, field_name)))
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
        _.each(summaries[field_name].summary, function(value, label){
          data.push({value: value, label: label});
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