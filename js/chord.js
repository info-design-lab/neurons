var order_names = [
    "Primata",
    "Glires",
    "Afrotheria",
    "Artiodactyla",
    "Eulipotyphla",
];

var order_count = [0, 0, 0, 0, 0];
var order_color = {
    "Primata": "#d7191c",
    "Glires": "#fdae61",
    "Afrotheria": "#ffffbf",
    "Artiodactyla": "#abd9e9",
    "Eulipotyphla": "#2c7bb6",
}

curr_index = 0; // index of current organism at focus


queue()
    .defer(d3.csv, 'data/data.csv')
    .await(makeChordVis);

function makeChordVis(error, data){
  	if(error){
  		console.log(error);
  	}

    data.forEach(function(d){
        d["Body Mass"] = parseInt(d["Body Mass"].replace(",", " "));
        d["Brain Mass"] = parseInt(d["Brain Mass"].replace(",", " "));
        d["Neurons Cortex"] = parseInt(d["Neurons Cortex"].replace(",", " "));
        d["Neurons Cerebellum"] = parseInt(d["Neurons Cerebellum"].replace(",", " "));
        d["Neurons (Rest of Brain)"] = parseInt(d["Neurons (Rest of Brain)"].replace(",", " "));
        d["Non Neurons Cortex"] = parseInt(d["Non Neurons Cortex"].replace(",", " "));
        d["Non Neurons Cerebellum"] = parseInt(d["Non Neurons Cerebellum"].replace(",", " "));
        d["Non Neurons (Rest of Brain)"] = parseInt(d["Non Neurons (Rest of Brain)"].replace(",", " "));
        d["Neurons Whole Brain"] = parseInt(d["Neurons Whole Brain"].replace(",", " "));
        d["Non Neurons Whole Brain"] = parseInt(d["Non Neurons Whole Brain"].replace(",", " "));

        d["Common Name"] = d["Common Name"].trim();
        d["Order"] = d["Order"].trim();
        d["Species"] = d["Species"].trim();
    });

    // sort the orgranisms based on the "order"
    data = groupOrders(data);

    var width = document.body.clientWidth;
    var height = width/2;
    var r = height/2 - 100;

    var svg = d3.select('#chord-diagram')
                .append('svg')
                .attr('width', width)
                .attr('height', height);

    var g = svg.append('g').attr('transform', 'translate(' + width/2 + ',' + height/2 +')');

    // Create the groupings in the circle
    var angleMap = d3.scaleLinear().domain([0, 40]).range([
        0, 
        2*Math.PI]);

    var offset = 0;
    for(var i = 0; i < order_count.length; i++){
        g.append("path")
            .attr('d', d3.arc()
                .innerRadius(r - 3)
                .outerRadius(r + 3)
                .startAngle((2*Math.PI - angleMap(offset)))
                .endAngle((2*Math.PI - angleMap(offset + order_count[i])))
                )
            .style('fill', order_color[order_names[i]]);
        offset += order_count[i];
    }

    var chord_organism = g.selectAll('circle')
        .data(data)
        .enter()

    var circles = chord_organism.append('circle')
                .attr('cx', (d, i) => (r + 20)*Math.cos(angleMap(i + 0.5)))
                .attr('cy', (d, i) => (r + 20)*Math.sin(angleMap(i + 0.5)))
                .attr('r', 10)
                .attr('id', (d, i) => "circle_" + i)
                .style('fill', "#a8a8a8")
                .style('stroke', (d, i) => ((i == curr_index) ? ("red") : "transparent"))
                .style('stroke-eright', 2)
                .on('click', function(d, i){
                    d3.select("#circle_" + curr_index).style('stroke', 'transparent');
                    curr_index = parseInt(this.id.split('_')[1]);
                    d3.select("#circle_" + curr_index).style('stroke', 'red');
                    //console.log(curr_index)
                    transition_chord();
                });

    var chord_text = chord_organism.append('text')
                .attr('text-anchor', function(d, i){
                    if((i < 40) && (i > 20)){
                        return "end";
                    }
                    return "start";
                })
                .attr('alignment-baseline', "middle")
                .attr('transform', function(d, i){
                    const x = ((r + 40)*Math.cos(angleMap(i + 0.5)));
                    const y = ((r + 40)*Math.sin(angleMap(i + 0.5)));
                    var theta = (angleMap(i+ 0.5)*180/Math.PI);

                    return 'translate(' + x + ', ' + y + ') rotate(' + theta + ')';
                })
                .text((d, i) => data[i]["Common Name"])

    //transition_chord();

    function transition_chord(){
        g.transition().duration(1000)
            .attr('transform', 'translate(' + width/2 + ',' + height/2 +') rotate(' + (-angleMap(curr_index + 0.5)*180/Math.PI - 180) + ')');

        chord_text
            .attr('text-anchor', function(d, i){
                    //if((theta - angleMap(curr_index) < 90) || (theta - angleMap(curr_index) > 270)){
                    //    return "end";
                    //}
                    return "start";
                })
            .attr('transform', function(d, i){
                    const x = ((r + 40)*Math.cos(angleMap(i+ 0.5)));
                    const y = ((r + 40)*Math.sin(angleMap(i+ 0.5)));
                    var theta = (angleMap(i+ 0.5)*180/Math.PI);
                    //console.log((theta - angleMap(curr_index)));
                    if((curr_index + 10)%40){
                        theta += 180;
                    }

                    return 'translate(' + x + ', ' + y + ') rotate(' + theta + ')';
                })

    }


    function groupOrders(data){
        group1 = [];
        group2 = [];
        group3 = [];
        group4 = [];
        group5 = [];

        for(var i in data){
            if(data[i]["Order"] == order_names[0]){group1.push(data[i]); order_count[0]++;}
            else if(data[i]["Order"] == order_names[1]){group2.push(data[i]); order_count[1]++;}
            else if(data[i]["Order"] == order_names[2]){group3.push(data[i]); order_count[2]++;}
            else if(data[i]["Order"] == order_names[3]){group4.push(data[i]); order_count[3]++;}
            else if(data[i]["Order"] == order_names[4]){group5.push(data[i]); order_count[4]++;}
        }

        group1 = group1.concat(group2);
        group1 = group1.concat(group3);
        group1 = group1.concat(group4);
        group1 = group1.concat(group5);

        return group1;
    }
}
