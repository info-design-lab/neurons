var order_names = [
    "Primata",
    "Glires",
    "Afrotheria",
    "Artiodactyla",
    "Eulipotyphla",
];

var order_count = [0, 0, 0, 0, 0];
var order_color = {
    "Primata": "#2c7bb6",
    "Glires": "#d7191c",
    "Afrotheria": "#fdae61",
    "Artiodactyla": "#bcbddc",
    "Eulipotyphla": "#7b3294",
}

var curr_index = 6; // index of current organism at focus
var hover_index = 10; // index of the organism which was hovered
var num_connections = 3;
var rank_vis_types = [
    //num, denom, scale
    ["Neurons Cortex", "Neurons Whole Brain", null, null],
    ["Neurons Cerebellum", "Neurons Whole Brain", null, null],
    ["Neurons Rest of Brain", "Non-Neurons Rest of Brain", null, null],
    ["Brain Mass", "Body Mass", null, null],
];

const font_size = 13;

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
        d["Neurons Rest of Brain"] = parseInt(d["Neurons Rest of Brain"].replace(",", " "));
        d["Non Neurons Cortex"] = parseInt(d["Non Neurons Cortex"].replace(",", " "));
        d["Non Neurons Cerebellum"] = parseInt(d["Non Neurons Cerebellum"].replace(",", " "));
        d["Non-Neurons Rest of Brain"] = parseInt(d["Non-Neurons Rest of Brain"].replace(",", " "));
        d["Neurons Whole Brain"] = parseInt(d["Neurons Whole Brain"].replace(",", " "));
        d["Non Neurons Whole Brain"] = parseInt(d["Non Neurons Whole Brain"].replace(",", " "));

        d["Common Name"] = d["Common Name"].trim();
        d["Order"] = d["Order"].trim();
        d["Species"] = d["Species"].trim();
    });

    // sort the orgranisms based on the "order"
    data = groupOrders(data);
    const chord_div_width = document.getElementById("chord-diagram").offsetWidth;
    const screenScale = d3.scaleLinear().domain([0, 2560]).range([0, chord_div_width]);
    var offset = 0;
    data.forEach(function(d, i){
        const len = d["Common Name"].length*font_size*0.6;
        if(len > offset) offset = len;
    });
    const margin = {
        top: offset,
        bottom: offset,
        left: 0,
        right: 0
    }
    const width = chord_div_width - margin.left - margin.right;
    const height = width/6;
    const r = height*0.6;

    var svg = d3.select('#chord-diagram')
                .append('svg')
                .attr('width', width + margin.left + margin.right)
                .attr('height', height + margin.top + margin.bottom);

    var angleMap = d3.scaleLinear().domain([0, 40]).range([
        0, 
        2*Math.PI]);

    var g = svg.append('g')
                .attr('transform', 'translate(' + margin.left + ', ' + margin.top + ')')
                .append('g')
                .attr('transform', 'translate(' + width/2 + ',' + height/2 +') rotate(' + (-angleMap(curr_index + 0.5)*180/Math.PI - 180) + ')');

    var chord_organism = g.selectAll('circle')
        .data(data)
        .enter()

    var circles = chord_organism.append('circle')
                .attr('cx', (d, i) => (r + 20)*Math.cos(angleMap(i + 0.5)))
                .attr('cy', (d, i) => (r + 20)*Math.sin(angleMap(i + 0.5)))
                .attr('r', screenScale(15))
                .attr('id', (d, i) => "circle_" + i)
                .style('fill', "#a8a8a8")
                .style('stroke', (d, i) => ((i == curr_index) ? (order_color[d["Order"]]) : "transparent"))
                .style('stroke-weight', 3)
                .style('cursor', 'pointer');

    var chord_text = chord_organism.append('text')
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
                .attr('alignment-baseline', "middle")
                .attr('dominant-baseline', "middle")
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
                })
                .style('cursor', 'pointer')
                .attr('font-weight', (d, i) => ((i == curr_index) ? 'bold' : 'normal'))
                .attr('font-size', (d, i) => ((i == curr_index) ? font_size + 3 : font_size))
                .text((d, i) => data[i]["Common Name"]);

    chord_organism.append("path")
        .attr('d', d3.arc()
                .innerRadius(r)
                .outerRadius(r + offset)
                .startAngle((d, i) => (angleMap(i)  + Math.PI/2))
                .endAngle((d, i) => (angleMap(i + 1)  + Math.PI/2))
                )
        .attr('id', (d, i) => ("#overlay_" + i))
        .style('fill', 'transparent')
        .style('cursor', 'pointer')
        .on('click', function(d, i){
            d3.select("#circle_" + curr_index).style('stroke', 'transparent');
            curr_index = parseInt(this.id.split('_')[1]);
            d3.select("#circle_" + curr_index).style('stroke', order_color[d["Order"]]);
            transition_chord();
        })
        .on('mouseover', function(d, i){
            hover_index = i;
            updateRankLine();
        });

    var line = d3.line()
                .curve(d3.curveBundle)
                .x(function (d) { return d[0]; })
                .y(function (d) { return d[1]; });

    createChords();
    createLegend();

    // Create the groupings in the circle
    var offset = 0;
    for(var i = 0; i < order_count.length; i++){
        g.append("path")
            .attr('d', d3.arc()
                .innerRadius(r - screenScale(1))
                .outerRadius(r + screenScale(3))
                .startAngle(angleMap(offset) + Math.PI/2)
                .endAngle(angleMap(offset + order_count[i]) + Math.PI/2)
                )
            .style('fill', order_color[order_names[i]]);
        offset += order_count[i];
    }

    const rank_vis_height = 70*rank_vis_types.length;
    const rank_margin = {
        left: 200,
        right: 100,
        top: 45,
        bottom: 0
    }
    const rank_vis_width = document.getElementById("rank-diagram").offsetWidth - rank_margin.left - rank_margin.right;
    var rank_svg = d3.select('#rank-diagram')
                .append('svg')
                .attr('width', rank_vis_width + rank_margin.left + rank_margin.right)
                .attr('height', rank_vis_height + rank_margin.top + rank_margin.bottom)
                .append('g')
                .attr('transform', 'translate(' + rank_margin.left + ', ' + rank_margin.top + ')')

    // Create rank vis
    var connecting_line_data = []; // data for line connecting the ranks
    var rank_organism = rank_svg.selectAll('circle')
        .data(data)
        .enter();

    rank_vis_types.forEach(function(d, i){
        var rank_data = getChordData(d[0], d[1], true);
        d[2] = d3.scaleLinear().domain([d3.min(rank_data), d3.max(rank_data)]).range([0, rank_vis_width]);

        rank_svg.append('text')
            .attr('x', -10)
            .attr('y', i*50 + 100 - 3)
            .attr('text-anchor', 'end')
            .text(d[0]);

        rank_svg.append('text')
            .attr('x', -10)
            .attr('y', i*50 + 100 + 3)
            .attr('text-anchor', 'end')
            .attr('alignment-baseline', 'hanging')
            .attr('dominant-baseline', 'hanging')
            .text(d[1]);

        rank_svg.append('line')
            .attr('x1', -10)
            .attr('x2', -100)
            .attr('y1', i*50 + 100)
            .attr('y2', i*50 + 100)
            .attr("stroke", 'grey')

        rank_svg.append('line')
            .attr('x1', 0)
            .attr('x2', rank_vis_width)
            .attr('y1', i*50 + 100)
            .attr('y2', i*50 + 100)
            .attr('stroke-width', 1)
            .style('stroke-linecap', 'round')
            .attr('stroke', '#bdbdbd');

        var circles = rank_organism.append('line')
            .attr('x1', (e, i) => d[2](rank_data[i]))
            .attr('y1', i*50 + 100 - 4)
            .attr('x2', (e, i) => d[2](rank_data[i]))
            .attr('y2', i*50 + 100 + 4)
            .attr('stroke', (d, i) => order_color[d["Order"]])
            .attr('stroke-width', 2)
            .style('opacity', 1)
            .on('mouseover', function(d, i){
                hover_index = i;
                updateRankLine();
            })

        d[3] = circles;

        // connecting line data
        for(j = -1; j < 2; j++){
            if(i == 0 && j == -1) continue;
            if(i == rank_vis_types.length - 1 && j == 1) continue;
            connecting_line_data.push([
                    d[2](rank_data[hover_index]),
                    i*50 + j*25 + 100
                ]); 
        }
    });

    // Rank vis text
    var rank_data = getChordData(rank_vis_types[0][0], rank_vis_types[0][1], true);
    var rank_text = rank_organism.append('text')
        .attr('transform', (d, i) => 'translate(' + rank_vis_types[0][2](rank_data[i]) + ',' + 90 + ') rotate(' + -45 + ')')
        .attr('alignment-baseline', 'middle')
        .attr('dominant-baseline', 'middle')
        .text((d, i) => d["Common Name"])

    // Rank vis connecting line
    var connecting_line = rank_svg.append('path')
        .datum(connecting_line_data)
        .attr('d', d3.line()
                .curve(d3.curveLinear)
                .x(function (d) { return d[0]; })
                .y(function (d) { return d[1]; }))
        .attr('fill', 'none')
        .attr('stroke', '#e7298a')
        .attr('stroke-width', 1)
        .attr('opacity', 1)

    function transition_chord(){
        g.transition().duration(2000)
            .attr('transform', 
                'translate(' + width/2 + ',' + height/2 +') rotate(' + (-angleMap(curr_index + 0.5)*180/Math.PI - 180) + ')');

        d3.selectAll('.connections').transition().duration(1000)
            .style('opacity', 0)
            .on('end', function(){
                d3.selectAll('.connections').remove()
                createChords()
            });

        chord_text
            .transition()
            .delay(1000)
            .duration(0)
            .attr('font-weight', (d, i) => ((i == curr_index) ? 'bold' : 'normal'))
            .attr('font-size', (d, i) => ((i == curr_index) ? font_size + 3 : font_size))
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

        // rank vis
        connecting_line_data = [];
        rank_vis_types.forEach(function(d, i){
            var rank_data = getChordData(d[0], d[1], true);
            d[2] = d3.scaleLinear().domain([d3.min(rank_data), d3.max(rank_data)]).range([0, rank_vis_width]);

            d[3].transition()
                .duration(2000)
                .attr('x1', (e, i) => d[2](rank_data[i]))
                .attr('x2', (e, i) => d[2](rank_data[i]));

            for(j = -1; j < 2; j++){
                if(i == 0 && j == -1) continue;
                if(i == rank_vis_types.length - 1 && j == 1) continue;
                connecting_line_data.push([
                        d[2](rank_data[hover_index]),
                        i*50 + j*25 + 100
                    ]); 
            }
        });

        var rank_data = getChordData(rank_vis_types[0][0], rank_vis_types[0][1], true);
        rank_text.transition()
            .duration(2000)
            .attr('transform', (d, i) => 'translate(' + rank_vis_types[0][2](rank_data[i]) + ',' + 90 + ') rotate(' + -45 + ')');
    
        connecting_line
            .datum(connecting_line_data)
            .transition()
            .duration(2000)
            .attr('d', d3.line()
                    .curve(d3.curveLinear)
                    .x(function (d) { return d[0]; })
                    .y(function (d) { return d[1]; }));
    }

    function createChords(){
        // Create chord based on the ratios
        var chord_data = getChordData('Brain Mass', 'Body Mass');
        console.log(chord_data);
        [chord_data.length - 1, 1, 2, 3].forEach(function(d, i){
            g.append('path')
                .datum([
                    [(r)*Math.cos(angleMap(curr_index + 0.5)), (r)*Math.sin(angleMap(curr_index + 0.5))],
                    [0, 0],
                    [(r)*Math.cos(angleMap(chord_data[d][1] + 0.5)), (r)*Math.sin(angleMap(chord_data[d][1] + 0.5))]
                    ])
                .attr('d', line)
                .style('fill', 'none')
                .style('stroke', () => ((d == chord_data.length - 1) ? '#ef3b2c' : '#74a9cf'))
                .style('stroke-width', function(){
                    if(d == chord_data.length - 1) return 1;
                    return 5 - d*2
                })
                .style('opacity', 0)
                .attr('class', 'connections');
        });

        var chord_data = getChordData('Neurons Cortex', 'Neurons Whole Brain');
        [chord_data.length - 1, 1, 2, 3].forEach(function(d, i){
            g.append('path')
                .datum([
                    [(r)*Math.cos(angleMap(curr_index + 0.5)), (r)*Math.sin(angleMap(curr_index + 0.5))],
                    [0, 0],
                    [(r)*Math.cos(angleMap(chord_data[d][1] + 0.5)), (r)*Math.sin(angleMap(chord_data[d][1] + 0.5))]
                    ])
                .attr('d', line)
                .style('fill', 'none')
                .style('stroke', () => ((d == chord_data.length - 1) ? '#ef3b2c' : '#74a9cf'))
                .style('stroke-width', function(){
                    if(d == chord_data.length - 1) return 1;
                    return 5 - d*2
                })
                .style("stroke-dasharray", "8,4")
                .style('opacity', 0)
                .attr('class', 'connections');
        });

        d3.selectAll('.connections').transition().duration(1000)
            .style('opacity', 1)
    }

    function createLegend(){
        var legend_width = document.getElementById("chord-legend").offsetWidth;
        var legend_height = 300;
        var legend = d3.select('#chord-legend').append('svg')
                        .attr('width', legend_width)
                        .attr('height', legend_height)

        legend.append('text')
            .attr('x', legend_width*0.5)
            .attr('y', 20)
            .attr('text-anchor', 'middle')
            .text('Brain Mass/Body Mass');

        [0, 1, 2, 38].forEach(function(d, i){
            legend.append('line')
                .attr('x1', 0)
                .attr('x2', 50)
                .attr('y1', i*20 + 40)
                .attr('y2', i*20 + 40)
                .style('fill', 'none')
                .style('stroke', () => ((d == 38) ? '#ef3b2c' : '#74a9cf'))
                .style('stroke-width', function(){
                    if(d == 38) return 1;
                    return 5 - d*2
                });

            legend.append('text')
                .attr('x', 60)
                .attr('y', i*20 + 40)
                .attr('alignment-baseline', 'middle')
                .attr('dominant-baseline', 'middle')
                .text(function(){
                    if(d == 38) return 'farthest' ;
                    return (d + 1) + 'st closest'
                });

            legend.append('line')
                .attr('x1', 0)
                .attr('x2', 50)
                .attr('y1', i*20 + 30 + 150)
                .attr('y2', i*20 + 30 + 150)
                .style('fill', 'none')
                .style('stroke', () => ((d == 38) ? '#ef3b2c' : '#74a9cf'))
                .style('stroke-width', function(){
                    if(d == 38) return 1;
                    return 5 - d*2
                })
                .style("stroke-dasharray", "8,4");

            legend.append('text')
                .attr('x', 60)
                .attr('y', i*20 + 30 + 150)
                .attr('alignment-baseline', 'middle')
                .attr('dominant-baseline', 'middle')
                .text(function(){
                    if(d == 38) return 'farthest' ;
                    return (d + 1) + 'st closest'
                });
        });

        legend.append('text')
            .attr('x', legend_width*0.5)
            .attr('y', 150)
            .attr('text-anchor', 'middle')
            .text('Neurons Cortex/Total Neurons');
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

        group1.sort(function(a, b){
            if(a["Common Name"] < b["Common Name"]) return -1;
            if(a["Common Name"] > b["Common Name"]) return 1;
            return 0;
        });
        group2.sort(function(a, b){
            if(a["Common Name"] < b["Common Name"]) return -1;
            if(a["Common Name"] > b["Common Name"]) return 1;
            return 0;
        });
        group3.sort(function(a, b){
            if(a["Common Name"] < b["Common Name"]) return -1;
            if(a["Common Name"] > b["Common Name"]) return 1;
            return 0;
        });
        group4.sort(function(a, b){
            if(a["Common Name"] < b["Common Name"]) return -1;
            if(a["Common Name"] > b["Common Name"]) return 1;
            return 0;
        });
        group5.sort(function(a, b){
            if(a["Common Name"] < b["Common Name"]) return -1;
            if(a["Common Name"] > b["Common Name"]) return 1;
            return 0;
        });

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

    function getChordData(num, denom, indexes=false){
        var ratios = [];
        for(var i in data){
            ratios.push(data[i][num]/data[i][denom]);
        }

        const selected_ratio = data[curr_index][num]/data[curr_index][denom];
        var differences = [];

        if(indexes){
            for(var i in ratios){
                differences.push(Math.abs(selected_ratio - ratios[i]));
            }
            return differences;
        }

        for(var i in ratios){
            differences.push([Math.abs(selected_ratio - ratios[i]), parseInt(i)]);
        }

        differences.sort(function(a, b){
            return a[0] - b[0]
        });

        return differences;
    }

    function updateRankLine(){
        connecting_line_data = [];

        rank_vis_types.forEach(function(d, i){
            var rank_data = getChordData(d[0], d[1], true);
            d[2] = d3.scaleLinear().domain([d3.min(rank_data), d3.max(rank_data)]).range([0, rank_vis_width]);

            for(j = -1; j < 2; j++){
                if(i == 0 && j == -1) continue;
                if(i == rank_vis_types.length - 1 && j == 1) continue;
                connecting_line_data.push([
                        d[2](rank_data[hover_index]),
                        i*50 + j*25 + 100
                    ]); 
            }
        });

        connecting_line
            .datum(connecting_line_data)
            .transition()
            .duration(100)
            .attr('d', d3.line()
                    .curve(d3.curveLinear)
                    .x(function (d) { return d[0]; })
                    .y(function (d) { return d[1]; }));
    }
}
