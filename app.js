(function(win){
  var dataset_id, dataset, info_ready, summary_ready, dimensions, exclude_list;

  exclude_list = ["name"];
  dataset_id = '3a18780972da435e8c7e345b34bfcd65';
  dataset_id = '890c9e48f0154197be128bf07ce08dee';
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
    var pie_options = {
      //Boolean - Whether we should show a stroke on each segment
      segmentShowStroke : true,
      //String - The colour of each segment stroke
      segmentStrokeColor : "#fff",
      //Number - The width of each segment stroke
      segmentStrokeWidth : 2,
      //Boolean - Whether we should animate the chart	
      animation : false,
      //Number - Amount of animation steps
      animationSteps : 100,
      //String - Animation easing effect
      animationEasing : "easeOutBounce",
      //Boolean - Whether we animate the rotation of the Pie
      animateRotate : false,
      //Boolean - Whether we animate scaling the Pie from the centre
      animateScale : false,
      //Function - Will fire on animation completion.
      onAnimationComplete : null
    };
    _.each(dimensions, function(field, field_name){
      if(typeof(exclude_list) == "undefined" || (typeof(exclude_list) != "undefined" && !_.contains(exclude_list, field_name)))
      {
        // create a canvas object
        var containing_span, title_elm, canvas_elm, context, chart, data;

        containing_span = $('<span>').addClass('span12');
        title_elm = $('<h2>').html(field.label);
        containing_span.append(title_elm);
        canvas_elm = $('<canvas>').attr('width', 400).attr('height', 400).attr('id', 'chart' + (++index));
        containing_span.append(canvas_elm);
        $('#charts').append(containing_span);
        //Get context with jQuery - using jQuery's .get() method.
        context = $(canvas_elm).get(0).getContext("2d");
        //This will get the first returned node in the jQuery collection.
        chart = new Chart(context);
        // generate data
        data = [];
        var temp_color_index = 0;
        _.each(summaries[field_name].summary, function(value, label){
          data.push({value: value, color: temp_colors[temp_color_index++]});
        });
        chart.Pie(data, pie_options); 
      }
    });
  };
  
  // how deferred could work
  // var deferred = dataset.info();
  // deferred.done(info_ready).summary('all', null).done(summary_ready);

  dataset.query_info(info_ready);
})(this);