var rank_types =[
    ["Body Mass", null, null],
    ["Brain Mass", null, null],
    ["Neurons Cortex", null, null],
    ["Neurons Cerebellum", null, null],
    ["Total Neurons", null, null],
];

var legend_combinations = {
    '1': ["Brain Mass", "Body Mass"],
    '2': ["Neurons Cortex", "Neurons Whole Brain"],
    '3': ["Neurons Cerebellum", "Neurons Whole Brain"],
    '4': ["Neurons Rest of the Brain", "Neurons Whole Brain"]
}
var first_ratio = legend_combinations[1];
var second_ratio = legend_combinations[2];

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

var curr_index = 1; // index of current organism at focus
var hover_index = curr_index; // index of the organism which was hovered
var num_connections = 3;
var chord_vis_types = [
    //num, denom, scale
    ["Neurons Cortex", "Neurons Whole Brain", null, null],
    ["Neurons Cerebellum", "Neurons Whole Brain", null, null],
    ["Neurons Rest of Brain", "Non-Neurons Rest of Brain", null, null],
    ["Brain Mass", "Body Mass", null, null],
];

const font_size = 13;

var rank_connecting_line, rank_text;

queue()
    .defer(d3.csv, 'data/data.csv')
    .await(makeRankVis);

function makeRankVis(error, data){
    if(error){
        console.log(error);
    }

    data.forEach(function(d){
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

    const rank_div_width = window.innerWidth;
    const screenScale = d3.scaleLinear().domain([0, 2560]).range([0, rank_div_width]);
    var offset = 0;
    data.forEach(function(d, i){
        const len = d["Common Name"].length*font_size*0.6;
        if(len > offset) offset = len;
    });

    const margin = {
        top: offset/Math.sqrt(2) + 10,
        bottom: 20,
        left: 120,
        right: 80
    }
    const width = rank_div_width - margin.left - margin.right;
    const height = margin.top + 50*rank_types.length;
    const r = height*0.6;

    var parentSVG = d3.select('#rank-diagram')
                .append('svg')
                .attr('width', width + margin.left + margin.right)
                .attr('height', height + margin.top + margin.bottom);

    var svg = parentSVG.append('g')
                .attr('transform', 'translate(' + margin.left + ', ' + margin.top + ')')

    var organism = svg.selectAll('circle')
        .data(data)
        .enter()

    var connecting_line_data = []; // data for line connecting the ranks

    rank_types.forEach(function(d, i){
        const vertical_offset = 5 + 40*i;
        svg.append('line')
            .attr('x1', 0)
            .attr('y1', vertical_offset)
            .attr('x2', width)
            .attr('y2', vertical_offset)
            .attr('stroke', 'grey')
            .style('stroke-linecap', 'round')
            .attr('stroke-width', 1);

        svg.append('text')
            .attr('x', -10)
            .attr('y', vertical_offset)
            .attr('text-anchor', 'end')
            .attr('dominant-baseline', 'middle')
            .attr('alignment-baseline', 'middle')
            .attr('font-size', 12)
            .text(d[0])

        d[1] = d3.scaleLinear().domain([0, 39]).range([0, width]);
        d[2] = getRankData(d[0]);

        organism.append('line')
            .attr('y1', vertical_offset - 4)
            .attr('y2', vertical_offset + 4)
            .attr('x1', (_, e) => d[1](d[2][e]))
            .attr('x2', (_, e) => d[1](d[2][e]))
            .attr('stroke', (_, e) => order_color[_["Order"]])
            .style('stroke-width', 2)
            .on('mouseover', function(d, i){curr_index = i; updateRankHover()});

        // connecting line data
        for(j = -1; j < 2; j++){
            if(i == 0 && j == -1) continue;
            if(i == rank_types.length - 1 && j == 1) continue;
            connecting_line_data.push([
                    d[1](d[2][curr_index]),
                    vertical_offset + j*20
                ]); 
        }
    });

    rank_text = organism.append('text')
            .attr('dominant-baseline', 'middle')
            .attr('alignment-baseline', 'middle')
            .attr('transform', (_, e) => "translate(" + (rank_types[0][1](rank_types[0][2][e])) + ", -5) rotate(-45)")
            .text((d, index) => (rank_types[0][2][index] + 1) + ". " + d["Common Name"])
            .attr('font-weight', (d, i) => (i == curr_index) ? "bold" : "normal")
            .attr('font-size', (d, i) => (i == curr_index) ? "15px" : "13px")
            .style('cursor', 'pointer')
            .on('mouseover', function(d, i){curr_index = i; updateRankHover()});

    // Rank vis connecting line
    rank_connecting_line = svg.append('path')
        .datum(connecting_line_data)
        .attr('d', d3.line()
                .curve(d3.curveLinear)
                .x(function (d) { return d[0]; })
                .y(function (d) { return d[1]; }))
        .attr('fill', 'none')
        .attr('stroke', '#e7298a')
        .attr('stroke-width', 1)
        .attr('opacity', 1);

    function getRankData(field){
        var dummy = [];
        data.forEach(function(d, i){
            dummy.push([d[field], i]);
        });

        dummy.sort(function(a, b){
            return -(a[0] - b[0]);
        });

        var ranks = {};

        dummy.forEach(function(d, i){
            ranks[d[1]] = i;
        })

        return ranks;
    }
}

function updateRankHover(){
    connecting_line_data = [];
     // connecting line data
    rank_types.forEach(function(d, i){
        const vertical_offset = 5 + 40*i;
        // connecting line data
        for(j = -1; j < 2; j++){
            if(i == 0 && j == -1) continue;
            if(i == rank_types.length - 1 && j == 1) continue;
            connecting_line_data.push([
                    d[1](d[2][curr_index]),
                    vertical_offset + j*20
                ]); 
        }
    });

    rank_connecting_line
        .datum(connecting_line_data)
        .transition()
        .duration(100)
        .attr('d', d3.line()
                .curve(d3.curveLinear)
                .x(function (d) { return d[0]; })
                .y(function (d) { return d[1]; }));

    rank_text.transition().duration(100)
        .attr('font-weight', (d, i) => (i == curr_index) ? "bold" : "normal")
        .attr('font-size', (d, i) => (i == curr_index) ? "15px" : "13px")
}
