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

var curr_index = 0; // index of current organism at focus
var num_connections = 3;

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

    var angleMap = d3.scaleLinear().domain([0, 40]).range([
        0, 
        2*Math.PI]);

    var g = svg.append('g').attr('transform', 'translate(' + width/2 + ',' + height/2 +') rotate(' + (-angleMap(curr_index + 0.5)*180/Math.PI - 180) + ')');

    // Create the groupings in the circle
    var offset = 0;
    for(var i = 0; i < order_count.length; i++){
        g.append("path")
            .attr('d', d3.arc()
                .innerRadius(r - 1)
                .outerRadius(r + 3)
                .startAngle(angleMap(offset) + Math.PI/2)
                .endAngle(angleMap(offset + order_count[i]) + Math.PI/2)
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
                .attr('r', 13)
                .attr('id', (d, i) => "circle_" + i)
                .style('fill', "#a8a8a8")
                .style('stroke', (d, i) => ((i == curr_index) ? ("red") : "transparent"))
                .style('stroke-eright', 2)
                .on('click', function(d, i){
                    d3.select("#circle_" + curr_index).style('stroke', 'transparent');
                    curr_index = parseInt(this.id.split('_')[1]);
                    d3.select("#circle_" + curr_index).style('stroke', 'red');
                    transition_chord();
                });

    var chord_text = chord_organism.append('text')
                .attr('text-anchor', function(d, i){
                    if((i < 30) && (i > 9)){
                        return "end";
                    }
                    return "start";
                })
                .attr('alignment-baseline', "middle")
                .attr('transform', function(d, i){
                    const x = (r + 40)*Math.cos(angleMap(i + 0.5));
                    const y = (r + 40)*Math.sin(angleMap(i + 0.5));
                    var theta = (angleMap(i+ 0.5)*180/Math.PI);

                    if((i < 30) && (i > 9)){
                        theta += 180;
                    }

                    return 'translate(' + x + ', ' + y + ') rotate(' + theta + ')';
                })
                .text((d, i) => data[i]["Common Name"]);

    var line = d3.line()
                .curve(d3.curveBundle)
                .x(function (d) { return d[0]; })
                .y(function (d) { return d[1]; });

    // Create chord connections based on the ratio
    data_sorted = [...data].sort(function(a, b){
        const r1 = a["Brain Mass"]/a["Body Mass"];
        const r2 = b["Brain Mass"]/b["Body Mass"];

        return r1 - r2
    });

    data_sorted.forEach(function(d, i){
        const index1 = data.indexOf(d);
        for(var j = 1; j < num_connections + 1; j++){
            if(i + j < data_sorted.length){
                var index2 = data.indexOf(data_sorted[i + j]);
                // make connection between i and i + j
                g.append('path')
                    .datum([
                        [(r)*Math.cos(angleMap(index1 + 0.5)), (r)*Math.sin(angleMap(index1 + 0.5))],
                        [0, 0],
                        [(r)*Math.cos(angleMap(index2 + 0.5)), (r)*Math.sin(angleMap(index2 + 0.5))]
                        ])
                    .attr('d', line)
                    .style('fill', 'none')
                    .style('stroke', '#a8a8a8')
                    .style('stroke-width', '2px')
                    .style('opacity', 0)
                    .attr('id', 'connection_' + index1 + '_' + index2)
                    .attr('class', 'connections');
            }
        }
    })


    transition_chord();

    function transition_chord(){
        g.transition().duration(1000)
            .attr('transform', 'translate(' + width/2 + ',' + height/2 +') rotate(' + (-angleMap(curr_index + 0.5)*180/Math.PI - 180) + ')')
            .on('end', function(){
                g.selectAll('.connections')
                    .style('stroke', function(d, i){
                        if(selectedPath(this.id)) return 'black';
                        return '#a8a8a8';
                    })
                    .style('stroke-width', function(d, i){
                        if(selectedPath(this.id)) return 5;
                        return 2;
                    })
                    .style('opacity', function(){
                        if(selectedPath(this.id)) return 1;
                        return 0;
                    })
            });

        chord_text
            .attr('text-anchor', function(d, i){
                    const a = (curr_index + 10)%40;
                    const b = (curr_index + 30)%40;

                    if((i < b) && (i > a) && (b > a)){
                        return "start";
                    } else if(!((i < a) && (i > b)) && (a > b)){
                        return "start";
                    }

                    return "end";
                })
            .attr('transform', function(d, i){
                    const x = ((r + 40)*Math.cos(angleMap(i+ 0.5)));
                    const y = ((r + 40)*Math.sin(angleMap(i+ 0.5)));
                    var theta = (angleMap(i+ 0.5)*180/Math.PI) - 180;
                    
                    const a = (curr_index + 10)%40;
                    const b = (curr_index + 30)%40;

                    if((i < b) && (i > a) && (b > a)){
                        theta += 180;
                    } else if(!((i < a) && (i > b)) && (a > b)){
                        theta += 180;
                    }

                    return 'translate(' + x + ', ' + y + ') rotate(' + theta + ')';
                });
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

    function selectedPath(id){
        var indexes = id.split('_');
        for(var i in indexes){
            if(indexes[i] == curr_index){
                return true;
            }
        }
        return false;
    }

}
