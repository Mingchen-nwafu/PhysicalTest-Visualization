 queue()
    .defer(d3.json, "/Student/test")
    .await(makeGraphs);

function makeGraphs(error, projectsJson) {
	
	//Clean projectsJson data
	var TestProjects = projectsJson;

	//Create a Crossfilter instance
	var ndx = crossfilter(TestProjects);


    

	//var options = [{option:"肺活量"},{option:"50米跑"}, {option:"立定跳远"},{option:"坐立体前屈"}]
	//var op = crossfilter(options);

	//Define Dimensions
	var CollegeDim = ndx.dimension(function(d) { return d["院系"]; });
	var MajorDim = ndx.dimension(function(d) { return d["专业"]; });
	var SexDim = ndx.dimension(function(d) { return d["性别"]; });
	var GradeDim = ndx.dimension(function(d) { return d["等级"]; });
	var BothDim = ndx.dimension(function(d) {return [d["院系"], d["专业"]];});
    var ScoreDim = ndx.dimension(function(d){return d["总分"];});
    //var ScatterDim = ndx.dimension(function(d) {return [d["50米跑"], d["肺活量"]];});



	//Calculate metrics
	
	var numTestByCollege = CollegeDim.group().reduceCount();
	var numTestByMajor = MajorDim.group();
	var numTestBySex = SexDim.group();
	var numTestByGrade = GradeDim.group().reduceCount(); 
	var MajorSum = BothDim.group();
    //var ScatterSum = ScatterDim.group();

   

    var all = ndx.groupAll();

    

    //TotalScore = ndx.groupAll().reduceSum(function(d) {return d["总分"];}); 

    TotalScore = ndx.groupAll().reduce(
    function(p,v){
        p.count++;
        p.sum += v["总分"];
        return p;
    },
    function(p,v){
        p.count--;
        p.sum -= v["总分"];
        return p;
    },
    //init
    function(p,v){
        return {count:0, sum:0};
    });

   
    



	var TestByBMI = CollegeDim.group().reduce(
        function (p, v) {
            // Retrieve the data value, if not Infinity or null add it.
            let dv = v["BMI"];
            if (dv != Infinity && dv != null) p.splice(d3.bisectLeft(p, dv), 0, dv);
            return p;
        },
        function (p, v) {
            // Retrieve the data value, if Infinity or null remove it.
            let dv = v["BMI"];
            if (dv != Infinity && dv != null) p.splice(d3.bisectLeft(p, dv), 1);
            return p;
        },
        function () {
            return [];
        }
    );

    var TestByRun50 = CollegeDim.group().reduce(
        function (p, v) {
            // Retrieve the data value, if not Infinity or null add it.
            let dv = v["短跑"];
            if (dv != Infinity && dv != null) p.splice(d3.bisectLeft(p, dv), 0, dv);
            return p;
        },
        function (p, v) {
            // Retrieve the data value, if Infinity or null remove it.
            let dv = v["短跑"];
            if (dv != Infinity && dv != null) p.splice(d3.bisectLeft(p, dv), 1);
            return p;
        },
        function () {
            return [];
        }
    );

    //Charts
	var CollegeChart = new dc.sunburstChart("#college-chart");
	var SexChart = new dc.pieChart("#sex-chart");
	var GradeChart = new dc.rowChart("#grade-chart");
	var TestPlot1 = new dc.boxPlot("#Test-chart1");
    var TestPlot2 = new dc.boxPlot("#Test-chart2");
    var CorChart = new dc.scatterPlot("#Cor-chart")
    //var ScatterChart = new dc.scatterPlot("#Scatter-chart");
    
    var TotalChart = new dc.numberDisplay("#TotalChart");
    var Total_Score = new dc.numberDisplay("#TotalScore");
    var d3SchemeCategory20b = [
        '#393b79','#5254a3','#6b6ecf','#9c9ede','#637939',
        '#8ca252','#b5cf6b','#cedb9c','#8c6d31','#bd9e39',
        '#e7ba52','#e7cb94','#843c39','#ad494a','#d6616b',
        '#e7969c','#7b4173','#a55194','#ce6dbd','#de9ed6'
    ];
    
    //var select = new dc.SelectMenu('#select');
	//var TestPlot2 = new dc.boxPlot("#Test-chart2");
	//var TestPlot3 = new dc.boxPlot("#Test-chart3");
	//var TestPlot4 = new dc.boxPlot("#Test-chart4");

    TotalChart
    .height(60)
    .formatNumber(d3.format("d"))
    .valueAccessor(function(d){return d; })
    .group(all);




    Total_Score
    .height(60)
    .group(TotalScore)
    .valueAccessor(function(d){return d.sum/d.count;})
    .formatNumber(d3.format(".3s"));



    
    CorDim = ndx.dimension(function(d){return [d["立定跳远"],d["身高"]];});
    CorGroup = CorDim.group(); 


    CorChart
    .width(800)
    .height(200)
    .x(d3.scaleLinear().domain([60,300]))
    .y(d3.scaleLinear().domain([140,200]))
    .brushOn(false)
    .xAxisLabel("立定跳远")
    .yAxisLabel("身高")
    .symbolSize(8)
    .clipPadding(10)
    .dimension(CorDim)
    .group(CorGroup);



	CollegeChart
	.width(800)
	.height(400)
	.dimension(BothDim)
	.group(MajorSum)
    //.colors(d3.scaleOrdinal(d3SchemeCategory20b))
	.innerRadius(50)
    //.legend(dc.legend());
    .ringSizes(CollegeChart.defaultRingSizes());

	GradeChart
	.width(300)
	.height(260)
	.dimension(GradeDim)
	.group(numTestByGrade)
	.label(function(d){
            return d.key + " : "+ " - " +(d.value / ndx.groupAll().reduceCount().value() * 100).toFixed(2) + "%";
        })
    .colors(d3.scaleOrdinal().range(d3.schemeCategory20))
	.xAxis().ticks(4);

	SexChart
	.width(300)
	.height(260)
	.dimension(SexDim)
    .group(numTestBySex)
	.on('pretransition', function(chart) {
        chart.selectAll('text.pie-slice').text(function(d) {
            return d.data.key + ' ' + dc.utils.printSingleValue((d.endAngle - d.startAngle) / (2*Math.PI) * 100) + '%';
        })
    });



    TestPlot1
    .width(800)
    .height(190)
    .dimension(CollegeDim)
    .group(TestByBMI)
    .tickFormat(d3.format('.1f'))
    .yAxisLabel("BMI")
    //.xAxisLabel("学院", 0)
    .elasticY(true)
    .elasticX(true);

    TestPlot2
    .width(800)
    .height(190)
    .dimension(CollegeDim)
    .group(TestByRun50)
    .tickFormat(d3.format('.1f'))
    .yAxisLabel("短跑（秒）")
    //.xAxisLabel("学院", 0)
    .elasticY(true)
    .elasticX(true);


    
    //.colorAccessor(function (d) { return d.key[2]; })
    //.colors(function(colorKey) { return plotColorMap[colorKey]; });




    dc.renderAll();

};