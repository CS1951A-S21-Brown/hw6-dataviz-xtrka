// Add your JavaScript code here
const MAX_WIDTH = Math.max(1080, window.innerWidth);
const MAX_HEIGHT = 720;
const margin = {top: 40, right: 100, bottom: 40, left: 175};

// Assumes the same graph width, height dimensions as the example dashboard. Feel free to change these if you'd like
let graph_1_width = (MAX_WIDTH / 2) - 10, graph_1_height = 350;
let graph_2_width = (MAX_WIDTH / 2) - 10, graph_2_height = 275;
let graph_3_width = MAX_WIDTH / 2, graph_3_height = 575;

// GRAPH 1. TOP 10 VIDEO GAMES OF ALL TIME
// Set up graph1
let svg_graph1 = d3.select("#graph1")
    .append("svg")
    .attr("width", graph_1_width)
    .attr("height", graph_1_height)
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top-5})`)
// Set up count
let countRef_graph1 = svg_graph1.append("g");

d3.csv("/data/video_games.csv").then(function(data) {
    // Return top 10 games according to Global_Sales
    data = getTopGames(data);

    // x-axis: Global_Sales
    // x-axis scale
    let x = d3.scaleLinear()
        .domain([0, d3.max(data, function(d) {return parseInt(d["Global_Sales"])})])
        .range([0, graph_1_width-margin.left-margin.right]);   

    // x-axis label
    svg_graph1.append("text")
        .attr("transform", `translate(${(graph_1_width-margin.left-margin.right)/2}, ${graph_1_height-margin.top-(margin.bottom/2)})`)
        .style("text-anchor", "middle")
        .text("Global Sales");
    
    // y-axis: Name
    // y-axis scale
    let y = d3.scaleBand()
        .range([0, graph_1_height-margin.top-margin.bottom])
        .domain(data.map(function(d) {return d["Name"]}))
        .padding(0.1)

    // Show y-axis
    svg_graph1.append("g")
        .call(d3.axisLeft(y).tickSize(0).tickPadding(10));

    // y-axis label
    svg_graph1.append("text")
        .attr("transform", `translate(${-margin.left*0.88}, ${(graph_1_height-margin.top-margin.bottom)/2})rotate(-90)`)
        .style("text-anchor", "middle")
        .text("Name");

    // Color for bars (gradient style)
    let color = d3.scaleOrdinal()
        .domain(data.map(function(d) { return d["Name"] }))
        .range(d3.quantize(d3.interpolateHcl("#66a0e2", "#81c2c3"), 10));
    
    // Bars
    let bars = svg_graph1.selectAll("rect")
        .data(data)
    bars.enter()
        .append("rect")
        .merge(bars)
        .transition()
        .duration(1000)
        .attr("fill", function(d) { return color(d["Name"]) })
        .attr("x", x(0))
        .attr("y", function(d) {return y(d["Name"])})
        .attr("width", function(d) {return x(parseInt(d["Global_Sales"]))})
        .attr("height", y.bandwidth());  

    // Counts
    let counts = countRef_graph1.selectAll("text")
        .data(data)
    counts.enter()
        .append("text")
        .merge(counts)
        .transition()
        .duration(1000)
        .attr("x", function(d) {return x(parseInt(d["Global_Sales"]))+10})
        .attr("y", function(d) {return y(d["Name"])+graph_1_height/10/2})
        .style("text-anchor", "start")
        .text(function(d) {return d["Global_Sales"] + " million"})
        .style("font", "11px sans-serif");

    // Title
    svg_graph1.append("text")
        .attr("transform", `translate(${(graph_1_width-margin.left-margin.right)/2}, ${-margin.top/2})`)
        .style("text-anchor", "middle")
        .style("font-size", 15)
        .text("Top 10 Video Games of All Time");

});

// GRAPH 2. TOP PUBLISHERS BY GENRE
// Set up graph2
let svg_graph2 = d3.select("#graph2")
    .append("svg")
    .attr("width", graph_2_width)
    .attr("height", graph_2_height)
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);
// Set up count
let countRef_graph2 = svg_graph2.append("g");
// Set up y-axis
let y_axis = svg_graph2.append("g");

// x-axis: Global_Sales
// x-axis scale
let x = d3.scaleLinear()
    .range([0, graph_2_width-margin.left-margin.right]);

// x-axis label
svg_graph2.append("text")
    .attr("transform", `translate(${(graph_2_width-margin.left-margin.right)/2}, ${graph_2_height-margin.top-(margin.bottom/2)})`)
    .style("text-anchor", "middle")
    .text("Global Sales"); 
   
// y-axis: Publisher
// y-axis scale
let y = d3.scaleBand()
            .range([0, graph_2_height-margin.top-margin.bottom])
            .padding(0.1);  // Improves readability

// y-axis label
svg_graph2.append("text")
        .attr("transform", `translate(${-margin.left*0.75}, ${(graph_2_height-margin.top-margin.bottom)/2})rotate(-90)`)
        .style("text-anchor", "middle")
        .text("Publisher");

// Title
let title_graph2 = svg_graph2.append("text")
        .attr("transform", `translate(${(graph_2_width-margin.left-margin.right)/2}, ${-margin.top/2})`)
        .style("text-anchor", "middle")
        .style("font-size", 15)

// On load, display "Sports" data
displayGenre("Sports")

// GRAPH 3. GENRE SALES BREAKDOWN BY REGION
// Set up graph
let svg_graph3 = d3.select("#graph3")
    .append("svg")
    .attr("width", graph_3_width)
    .attr("height", graph_3_height)
    .append("g")
    // Center
    .attr("transform", `translate(${graph_3_width/2}, ${graph_3_height/2})`);

// Title
let title_graph3 = svg_graph3.append("text")
    .attr("transform", `translate(${0}, ${-graph_3_height/2+margin.top+15})`)
    .style("text-anchor", "middle")
    .style("font-size", 15)

// Tooltip
let tooltip = d3.select("#graph3")
    .append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

// Colors (12 genres)
let colors = ['#e6194b', '#3cb44b', '#ffe119', '#4363d8', '#f58231', '#911eb4', '#46f0f0', '#f032e6', '#bcf60c', '#fabebe', '#008080', '#6492d4']

// Legend
d3.csv("/data/video_games.csv").then(function(data) {
    // Get unique genres (12)
    genres = getGenres(data)

    // Set up legend -- Four rows of three genres each
    for (i=0; i<3; i++) {
        for (j=0; j<4; j++) {
            svg_graph3.append("rect")
                .attr("transform", `translate(${(300*(i-1))/2-50}, ${(graph_3_height-margin.bottom)/2-55+17*j})`) 
                .attr("width", 15)
                .attr("height", 15)
                .style("fill", colors[i*4+j]);
            svg_graph3.append("text")
                .attr("transform", `translate(${(300*(i-1))/2-30}, ${(graph_3_height-margin.bottom)/2-43+17*j})`) 
                .text(function(d) { return genres[i*4+j]; });
        } 
    }
});

// On load, display NA data
displayRegion("NA_Sales")
// Activate tooltip
displayRegion("NA_Sales")

// Clean data for graph1
function getTopGames(data) {
    // Sort by Global_Sales and return top 10
    data = data.sort(function(a,b) {return parseInt(b.Global_Sales)-parseInt(a.Global_Sales)});
    return data.slice(0, 10)
}

// Clean data for grpah2
function getTopPublishers(data, genre) {
    // Filter by genre
    data = data.filter(function(d) {return d["Genre"] == genre})
    
    // Key: Publisher, Value: Total Sales
    let results = {}

    // Get unique publishers
    let publishers = d3.map(data, function(d){return(d.Publisher)}).keys()
    for (i=0; i<publishers.length; i++) {
        // Filter by publisher
        data_by_publisher = data.filter(function(d) {return d["Publisher"] == publishers[i]})

        // Clean publisher names and round Global_Sales to two decimals
        if (publishers[i].length > 20) {
            results[publishers[i].slice(0,20)+"..."] = +d3.sum(data_by_publisher, d => d["Global_Sales"]).toFixed(2)
        }
        else {
            results[publishers[i]] = +d3.sum(data_by_publisher, d => d["Global_Sales"]).toFixed(2)
        }
    }

    // Create map
    let m = Object.entries(results).map(d => {
        return {
            Publisher: d[0],
            Global_Sales: d[1]
        }
    })

    // Sort by Global_Sales and return top 5
    data = m.sort(function(a,b) {return parseInt(b.Global_Sales)-parseInt(a.Global_Sales)});
    return data.slice(0, 5)
}

// Get data for graph3 (tooltip)
function getGenres(data) {
    // Return unique genres
    return d3.map(data, function(d){return(d.Genre)}).keys()
}

// Get data for graph3 (tooltip: dynamic stats)
function getTotal(data, region) {
    // Return total sales of region
    return d3.sum(data, d => d[region])
}

// Clean data for graph3
function getRegionalSalesByGenre(data, genres, region) {
    // Key: Genre, Value: Total region sales
    let results = {}
    for (i=0; i<genres.length; i++) {
        data_by_genre = data.filter(function(d) {return d["Genre"] == genres[i]})
        results[genres[i]] = d3.sum(data_by_genre, d => d[region])
    }
    return results
}

// Display graph2
function displayGenre(genre) {

    d3.csv("/data/video_games.csv").then(function(data) {
    
        data = getTopPublishers(data, genre)

        // Update x and y domains
        x.domain([0, d3.max(data, function(d) {return d["Global_Sales"]})]);
        y.domain(data.map(d => d["Publisher"]));
        // Show y-axis
        y_axis.call(d3.axisLeft(y).tickSize(0).tickPadding(10));

        // Color: Assign each Publisher a color (highlight top publisher in distinct color)
        let color = d3.scaleOrdinal()
            .domain(data.map(d => d["Publisher"]))
            // Top publisher in #e6194b (red), remaining publishers in #767676 (gray)
            .range(['#e6194b', '#767676', '#767676', '#767676', '#767676']);

        // Bars
        let bars = svg_graph2.selectAll("rect")
            .data(data);
        bars.enter()
            .append("rect")
            .merge(bars)
            .transition()
            .duration(1000)
            .attr("x", x(0))
            .attr("y", function(d) {return y(d["Publisher"])})
            .attr("width", function(d) {return x(parseInt(d["Global_Sales"]))})
            .attr("height",  y.bandwidth())
            .attr("fill", function(d) { return color(d["Publisher"]) })

        // Counts
        let counts = countRef_graph2.selectAll("text")
            .data(data);
        counts.enter()
            .append("text")
            .merge(counts)
            .transition()
            .duration(1000)
            .attr("x", function(d) {return x(parseInt(d["Global_Sales"])+10)})      // offset
            .attr("y", function(d) {return y(d.Publisher)+graph_2_height/5/2-(11/2)})      // offset
            .style("text-anchor", "start")
            .text(function(d) {return d["Global_Sales"] + " million"})
            .style("font", "11px sans-serif");
        
        // Update title
        title_graph2.text("Top Publishers in " + genre);

        // Remove on update
        bars.exit().remove();
        counts.exit().remove();
    });
}

// Display graph3
function displayRegion(region) {

    d3.csv("/data/video_games.csv").then(function(data) {
        // Get total sales of region
        total = getTotal(data, region)
        // Get unique genres (12)
        genres = getGenres(data)
        // Get sales for region broken down by genre
        data = getRegionalSalesByGenre(data, genres, region)
        
        // Color: Assign each Genre a color
        let color = d3.scaleOrdinal()
                        .domain(data)
                        .range(colors);
        
        // Tooltip: Show Genre and % of total sales on hover
        let mouseover = function(d) {
            // Get Genre color
            let color_span = `<span style="color: ${color(d.data.key)};">`;
            // Display genre (colored) and % of total sales (rounded to two decimals)
            let html = `${color_span}${d.data.key}</span><br/>
                        ${(d.data.value/total*100).toFixed(2)}%<br/>`; 
            // Display in center of chart
            tooltip.html(html)
                .style("left", `${graph_3_width/2-75+10+5}px`)
                .style("top", `${(graph_3_height-margin.top-margin.bottom)/2}px`)
                .transition()
                .duration(200)
                .style("opacity", 1)
            
            // Highlight pie on hover
            d3.select(this).style("opacity", 1);
        };

        // Tooltip: Hide tooltip on exit
        let mouseout = function(d) {
            // Hide
            tooltip.transition()
                .duration(200)
                .style("opacity", 0);
            
            // Unhighlight pie
            d3.select(this).style("opacity", 0.85);
        };

        // Pie chart
        // Set up pie and data
        let pie = d3.pie()
            .value(function(d) { return d.value; })
            .sort(function(a, b) { return d3.ascending(a.key, b.key);} ) // Keep order
        let data_pie = pie(d3.entries(data))

        // Create pieces
        let pieces = svg_graph3.selectAll("path")
                    .data(data_pie)
        pieces.enter()
            .append("path")
            .merge(pieces)
            .transition()
            .duration(1000)
            .attr('d', d3.arc()
                .innerRadius(100)
                .outerRadius(200))
            .attr('fill', function(d){ return(color(d.data.key)) })
            .attr("stroke", "white")
            .style("stroke-width", "2px")
            .style("opacity", 0.85)
        // Tooltip
        pieces.on('mouseover', mouseover)
            .on('mouseout', mouseout); 

        // Update title
        if (region == "NA_Sales") {
            title_graph3.text("Sales by Genre in North America");
        } else if (region == "EU_Sales") {
            title_graph3.text("Sales by Genre in Europe");
        } else {
            title_graph3.text("Sales by Genre in Japan");
        }
        
        // Remove on update
        pieces.exit()
            .remove()  
    });
}