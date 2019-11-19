var order_names = [
    "Primata",
    "Glires",
    "Afrotheria",
    "Artiodactyla",
    "Eulipotyphla",
];

var order_count = [0, 0, 0, 0, 0];
var order_color = {
    "Primata": "#39746D",
    "Glires": "#40113A",
    "Afrotheria": "#A72A4E",
    "Artiodactyla": "#D2802E",
    "Eulipotyphla": "#8A9530",
}

var curr_index = -1; // index of current organism at focus
var rank_hover_index = curr_index; // index of the organism which was hovered
var chord_ratio = ["Brain Mass", "Body Mass"]
var rank_vis_variables = {
        'numerator': chord_ratio[0],
        "denominator": chord_ratio[1],
        "rank_scale": null,
        "ratio_scale": null,
        "organisms": null
    }

var rank_types =[
    ["Body Mass", null, null],
    ["Brain Mass", null, null],
    ["Neurons Cortex", null, null],
    ["Neurons Cerebellum", null, null],
    ["Total Neurons", null, null],
];

rank_hover_index = 0;

const visualization_width = document.getElementById("visualization").offsetWidth*0.6;
const screenScale = d3.scaleLinear().domain([0, 2560]).range([0, visualization_width]);
const font_size = 10;

var g, width, height, angleMap, chord_text, connecting_line, r, data, 
    rank_text, chord_rank_text, rank_vis_width, line, rank_connecting_lines, rank_scale, rank_label;
const vertical_offset = 90;


String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};

queue()
    .defer(d3.csv, 'data/data.csv')
    .await(makeChordVis);

function makeChordVis(error, rawdata){
  	if(error){
  		console.log(error);
  	}

    rawdata.forEach(function(d){
        d["Body Mass"] = parseInt(d["Body Mass"].replaceAll(",", ""));
        d["Brain Mass"] = parseInt(d["Brain Mass"].replaceAll(",", ""));
        d["Neurons Cortex"] = parseInt(d["Neurons Cortex"].replaceAll(",", ""));
        d["Neurons Cerebellum"] = parseInt(d["Neurons Cerebellum"].replaceAll(",", ""));
        d["Neurons Rest of Brain"] = parseInt(d["Neurons Rest of Brain"].replaceAll(",", ""));
        d["Non Neurons Cortex"] = parseInt(d["Non Neurons Cortex"].replaceAll(",", ""));
        d["Non Neurons Cerebellum"] = parseInt(d["Non Neurons Cerebellum"].replaceAll(",", ""));
        d["Non-Neurons Rest of Brain"] = parseInt(d["Non-Neurons Rest of Brain"].replaceAll(",", ""));
        d["Neurons Whole Brain"] = parseInt(d["Neurons Whole Brain"].replaceAll(",", ""));
        d["Non Neurons Whole Brain"] = parseInt(d["Non Neurons Whole Brain"].replaceAll(",", ""));
        d["Total Neurons"] = parseInt(d["Total Neurons"].replaceAll(",", ""));
        d["Total Non Neurons"] = parseInt(d["Total Non Neurons"].replaceAll(",", ""));

        d["Common Name"] = d["Common Name"].trim();
        d["Order"] = d["Order"].trim();
        d["Species"] = d["Species"].trim();
    });

    // sort the orgranisms based on the "order"
    data = groupOrders(rawdata);
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
    width = visualization_width - margin.left - margin.right;
    r = width*0.15;
    height = 2*r;

    var svg = d3.select('#chord-diagram')
                .append('svg')
                .attr('width', width + margin.left + margin.right)
                .attr('height', height + margin.top + margin.bottom);

    angleMap = d3.scaleLinear().domain([0, 40]).range([
        0, 
        2*Math.PI]);

    g = svg.append('g')
                .attr('transform', 'translate(' + margin.left + ', ' + margin.top + ')')
                .append('g')
                .attr('transform', 'translate(' + width/2 + ',' + height/2 +') rotate(' + (-angleMap(curr_index + 0.5)*180/Math.PI - 180) + ')');

    var chord_organism = g.selectAll('circle')
        .data(data)
        .enter()

    var circles = chord_organism.append('circle')
                .attr('cx', (d, i) => (r + 20)*Math.cos(angleMap(i + 0.5)))
                .attr('cy', (d, i) => (r + 20)*Math.sin(angleMap(i + 0.5)))
                .attr('r', screenScale(25))
                .attr('id', (d, i) => "circle_" + i)
                .style('fill', "#a8a8a8")
                .style('stroke', (d, i) => ((i == curr_index) ? (order_color[d["Order"]]) : "transparent"))
                .style('stroke-weight', 3)
                .style('cursor', 'pointer');

    chord_text = chord_organism.append('text')
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
            if(curr_index == parseInt(this.id.split('_')[1])){
                curr_index = -1;
            } else{
                curr_index = parseInt(this.id.split('_')[1]);
            }
            
            transition_chord();
        })
        .on('mouseover', function(d, i){
            rank_hover_index = i;
            hightlightHoverElements();
        });

    line = d3.line()
                .curve(d3.curveBundle)
                .x(function (d) { return d[0]; })
                .y(function (d) { return d[1]; });

    createChords();

    var legend_width = document.getElementById("visualization").offsetWidth*0.2;
    var legend_height = 150;
    var legend_svg = d3.select('#chord-legend')
                    .append('svg')
                    .attr('width', legend_width)
                    .attr('height', legend_height)

    createLegend();

    g.append("circle")
        .attr("cx", 0)
        .attr("cy", 0)
        .attr("r", r)
        .attr('fill', 'transparent')
        .style("cursor", "pointer")
        .on("click", function(){
            d3.select("#circle_" + curr_index).style('stroke', 'transparent');
            curr_index = -1;
            rank_label.text("Ratio");
            document.getElementById("chord-image").style.visibility = "hidden";

            transition_chord();
        })

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

    // Rank Visualization
    const rank_vis_height = 200;
    const rank_margin = {
        left: 200,
        right: 100,
        top: 45,
        bottom: 0
    }

    rank_vis_width = document.getElementById("visualization").offsetWidth - rank_margin.left - rank_margin.right;
    var rank_svg = d3.select('#linear-diagram')
                .append('svg')
                .attr('width', rank_vis_width + rank_margin.left + rank_margin.right)
                .attr('height', rank_vis_height + rank_margin.top + rank_margin.bottom)
                .append('g')
                .attr('transform', 'translate(' + rank_margin.left + ', ' + rank_margin.top + ')')

    rank_label = rank_svg.append("text")
        .attr("x", -10)
        .attr("y", vertical_offset + 70)
        .style("text-anchor", "end")
        .style("alignment-baseline", "middle")
        .style("dominant-baseline", "middle")
        .text("Ratio")

    // Create rank vis
    var rank_organism = rank_svg.selectAll('circle')
        .data(data)
        .enter();

    var rank_data = getChordData(rank_vis_variables.numerator, rank_vis_variables.denominator, false);
    rank_vis_variables.ratio_scale = d3.scaleLinear().domain([d3.min(rank_data, (d, i) => d[0]), d3.max(rank_data, (d, i) => d[0])]).range([0, rank_vis_width]);
    rank_vis_variables.rank_scale = d3.scaleLinear().domain([0, rank_data.length - 1]).range([0, rank_vis_width]);

    // Rank vis text
    chord_rank_text = rank_organism.append('text')
        .attr('transform', function(d, i){
            var rank_index = 0;
            rank_data.forEach(function(e, f){
                if(e[1] == i) {
                    rank_index = f;
                }
            });
            var x = rank_vis_variables.rank_scale(rank_index);

            return 'translate(' + x + ',' + vertical_offset + ') rotate(' + -45 + ')'
        })
        .attr('alignment-baseline', 'middle')
        .attr('dominant-baseline', 'middle')
        .attr('font-size', font_size)
        .attr('font-size', (d, i) => (i == curr_index) ? font_size + 3 : font_size)
        .attr('font-weight', (d, i) => (i == curr_index) ? 'bold' : 'normal')
        .text((d, i) => d["Common Name"])
        .attr('cursor', 'pointer')
        .on('mouseover', function(d, i){
            rank_hover_index = i;
            hightlightHoverElements()
        })
        .on('click', function(d, i){
            d3.select("#circle_" + curr_index).style('stroke', 'transparent');
            if(curr_index == i){
                curr_index = -1;
            } else{
                curr_index = i;
            }
            transition_chord();
        })

    rank_connecting_lines = rank_organism.append("path")
        // .attr('stroke', (d, i) => order_color[d["Order"]])
        .attr('stroke', "#808080")
        .attr('fill', 'none')
        .attr('stroke-width', 1)
        .attr('opacity', 1)
        .datum(function(d, i){
            var rank_index = 0;
            rank_data.forEach(function(e, f){
                if(e[1] == i) {
                    rank_index = f;
                }
            });
            var x = rank_vis_variables.rank_scale(rank_index);

            return [[x, vertical_offset + 10],
                    [x, vertical_offset + 20],
                    [rank_vis_variables.ratio_scale(rank_data[rank_index][0]), vertical_offset + 60],
                    [rank_vis_variables.ratio_scale(rank_data[rank_index][0]), vertical_offset + 70]]
        })
        .attr('d', d3.line()
                .curve(d3.curveLinear)
                .x(function (d) { return d[0]; })
                .y(function (d) { return d[1]; }));

    rank_scale = rank_svg.append("g")
        .attr("transform", "translate(0, " + (vertical_offset + 70) + ")")
        .call(d3.axisBottom(rank_vis_variables.ratio_scale))

    // Legend selection
    var classname = document.getElementsByClassName("ratio_selector");
    for (var i = 0; i < classname.length; i++) {
        classname[i].addEventListener('change', function(){
            if(this.name === "numerator"){
                chord_ratio[0] = this.value
            } else if(this.name === "denomiator"){
                chord_ratio[1] = this.value
            }

            rank_vis_variables.numerator = chord_ratio[0];
            rank_vis_variables.denominator = chord_ratio[1];
            // d3.selectAll('.connections').remove()
            createChords();
            transition_chord()
        });
    }

    document.getElementById("chord-image").style.top = margin.top + r;



    function createLegend(){
        d3.selectAll('.legend-lines').remove();
        var legend = legend_svg.append('g')
                    .attr('class', 'legend-lines');


        [1, 2, 3, data.length - 1, data.length - 2, data.length - 3].forEach(function(d, i){

            if(chord_ratio.length > 0){
                legend.append('line')
                    .attr('x1', 0)
                    .attr('x2', 50)
                    .attr('y1', i*20 + 20)
                    .attr('y2', i*20 + 20)
                    .style('fill', 'none')
                    .style('stroke', () => ((d > 3) ? '#ef3b2c' : '#74a9cf'))
                    .style('stroke-width', function(){
                        if(d > 3) return (data.length - d)*1.5;
                        return 5 - d*1.5
                    });

                legend.append('text')
                    .attr('x', 60)
                    .attr('y', i*20 + 20)
                    .attr('alignment-baseline', 'middle')
                    .attr('dominant-baseline', 'middle')
                    .attr('font-size', font_size)
                    .text(function(){
                        if(d > 3) return (4 - (data.length - d)) + 'st farthest';
                        return (d) + 'st closest'
                    });

            }
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


    function hightlightHoverElements(){
        chord_rank_text
            .attr('font-size', (d, i) => (rank_hover_index == i || i == curr_index) ? font_size + 3 : font_size)
            // .style('opacity', (d, i) => (rank_hover_index == i || i == curr_index) ? 1 : 0.2)
            .attr('font-weight', (d, i) => (rank_hover_index == i || i == curr_index) ? 'bold' : 'normal');

        chord_text
            .attr('font-size', (d, i) => (rank_hover_index == i || i == curr_index) ? font_size + 3 : font_size)
            .attr('font-weight', (d, i) => (rank_hover_index == i || i == curr_index) ? 'bold' : 'normal');

        rank_connecting_lines
            .attr("stroke", (d, i) => ((i === rank_hover_index) ? ("black") : ("#808080")))
            .attr("stroke-width", (d, i) => ((i === rank_hover_index) ? (2) : (1)))
    }
}

function getChordData(num, denom, indexes=false){
    var ratios = [];
    for(var i in data){
        if(data[i][denom] < 0.01){
            ratios.push(data[i][num]/0.1);
        } else{
            ratios.push(data[i][num]/data[i][denom]);
        }
    }

    var selected_ratio = (curr_index === -1) ? 0: data[curr_index][num]/data[curr_index][denom]
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


function createChords(){
    // Create chord based on the ratios
    if(chord_ratio.length > 0){
        var chord_data = getChordData(chord_ratio[0], chord_ratio[1]);
        [1, 2, 3, chord_data.length - 1, chord_data.length - 2, chord_data.length - 3].forEach(function(d, i){
            g.append('path')
                .datum([
                    [(r)*Math.cos(angleMap(curr_index + 0.5)), (r)*Math.sin(angleMap(curr_index + 0.5))],
                    [0, 0],
                    [(r)*Math.cos(angleMap(chord_data[d][1] + 0.5)), (r)*Math.sin(angleMap(chord_data[d][1] + 0.5))]
                    ])
                .attr('d', line)
                .style('fill', 'none')
                .style('stroke', () => ((d > 3) ? '#ef3b2c' : '#74a9cf'))
                .style('stroke-width', function(){
                    if(d > 3) return 5 - (chord_data.length - d)*1.5;
                    return 5 - d*1.5
                })
                .style('opacity', 0)
                .attr('class', 'connections');
        });
    }

    d3.selectAll('.connections').transition().duration(1000)
        .style('opacity', (curr_index == -1) ? 0 : 1);
}

function transition_chord(){
    if(curr_index != -1){
        g.transition().duration(2000)
            .attr('transform', 
                'translate(' + width/2 + ',' + height/2 +') rotate(' + (-angleMap(curr_index + 0.5)*180/Math.PI - 180) + ')');
    
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

        
        d3.select("#circle_" + curr_index).style('stroke', order_color[data[curr_index]["Order"]]);
        rank_label.text("Ratio Difference");
        document.getElementById("chord-image").style.visibility = "visible";
        document.getElementById("chord-image").src = "images/Resized/" + data[curr_index]["Common Name"] + ".png";
    
    } else{
        rank_label.text("Ratio");
        document.getElementById("chord-image").style.visibility = "hidden";
    }

  
    d3.selectAll('.connections').transition().duration(1000)
        .style('opacity', 0)
        .on('end', function(){
            d3.selectAll('.connections').remove()
            createChords()
        });

    
    // rank vis
    var rank_data = getChordData(rank_vis_variables.numerator, rank_vis_variables.denominator, false);
    rank_vis_variables.ratio_scale = d3.scaleLinear().domain([d3.min(rank_data, (d, i) => d[0]), d3.max(rank_data, (d, i) => d[0])]).range([0, rank_vis_width]);
    rank_vis_variables.rank_scale = d3.scaleLinear().domain([0, rank_data.length - 1]).range([0, rank_vis_width]);

    chord_rank_text.transition()
        .duration(2000)
        .attr('transform', function(d, i){
        var rank_index = 0;
        rank_data.forEach(function(e, f){
            if(e[1] == i) {
                rank_index = f;
            }
        });
        var x = rank_vis_variables.rank_scale(rank_index);

        return 'translate(' + x + ',' + vertical_offset + ') rotate(' + -45 + ')'
    })

    rank_connecting_lines
        .datum(function(d, i){
            var rank_index = 0;
            rank_data.forEach(function(e, f){
                if(e[1] == i) {
                    rank_index = f;
                }
            });
            var x = rank_vis_variables.rank_scale(rank_index);

            return [[x, vertical_offset + 10],
                    [x, vertical_offset + 20],
                    [rank_vis_variables.ratio_scale(rank_data[rank_index][0]), vertical_offset + 60],
                    [rank_vis_variables.ratio_scale(rank_data[rank_index][0]), vertical_offset + 70]]
        })
        .transition()
        .duration(2000)
        .attr('d', d3.line()
                .curve(d3.curveLinear)
                .x(function (d) { return d[0]; })
                .y(function (d) { return d[1]; }));

    rank_scale.transition()
        .duration(2000)
        .call(d3.axisBottom(rank_vis_variables.ratio_scale))
}