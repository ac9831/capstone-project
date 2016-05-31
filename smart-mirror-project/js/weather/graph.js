var chartData = [
    {
        "date": "현재",
        "townName": "17.1",
        "townName2": "17.1",
        "townSize": 14,
        "latitude": 17.1,
    },
    {
        "date": "3시",
        "townName": "14.9",
        "townName2": "14.9",
        "townSize": 14,
        "latitude": 14.9,
    },
    {
        "date": "6시",
        "townName": "13.8",
        "townName2": "13.8",
        "townSize": 14,
        "latitude": 13.8,
    },
    {
        "date": "9시",
        "townName": "18.9",
        "townName2": "18.9",
        "townSize": 14,
        "latitude": 18.9,
    },
    {
        "date": "12시",
        "townName": "23.0",
        "townName2": "23.0",
        "townSize": 14,
        "latitude": 23.0,
    },
    {
        "date": "15시",
        "townName": "25.2",
        "townName2": "25.2",
        "townSize": 14,
        "latitude": 25.2,
    },
    {
        "date": "18시",
        "townName": "23.2",
        "townName2": "23.2",
        "townSize": 14,
        "latitude": 23.2,
    },
    {
        "date": "21시",
        "townName": "18.6",
        "townName2": "18.6",
        "townSize": 14,
        "latitude": 18.6,
    },
    {
        "date": "24시",
        "townName": "16.1",
        "townName2": "16.1",
        "townSize": 14,
        "latitude": 16.1,
    },
    {
        "date": "27시",
        "townName": "15.0",
        "townName2": "15.0",
        "townSize": 14,
        "latitude": 15.0,
    },
    {
        "date": "30시",
        "townName": "15.0",
        "townName2": "15.0",
        "townSize": 14,
        "latitude": 15.0,
    },
    {
        "date": "33시",
        "townName": "18.9",
        "townName2": "18.9",
        "townSize": 14,
        "latitude": 18.9,
    },
    {
        "date": "36시",
        "townName": "23.2",
        "townName2": "23.2",
        "townSize": 14,
        "latitude": 23.2,
    },
    {
        "date": "39시",
        "townName": "25.2",
        "townName2": "25.2",
        "townSize": 14,
        "latitude": 25.2,
    }
];

var chart = AmCharts.makeChart("chartdiv", {
    type: "serial",
    // dataDateFormat: "YYYY-MM-DD",
    dataProvider: chartData,

    addClassNames: true,
    startDuration: 1,
    color: "#FFFFFF",
    marginLeft: 0,

    categoryField: "date",
    categoryAxis: {
        parseDates: false,
        // minPeriod: "DD",
        autoGridCount: true,
        gridCount: 50,
        gridAlpha: 0.1,
        gridColor: "#FFFFFF",
        axisColor: "#555555"
        /*
         dateFormats: [{
         period: 'DD',
         format: 'DD'
         }, {
         period: 'WW',
         format: 'MMM DD'
         }, {
         period: 'MM',
         format: 'MMM'
         }, {
         period: 'YYYY',
         format: 'YYYY'
         }]
         */
    },
    graphs: [{
        id: "g2",
        valueField: "latitude",
        title: "3시간 간격 온도",
        type: "line",
        valueAxis: "a2",
        lineColor: "#F1C40F", //"#786c56",
        lineThickness: 1,
        legendValueText: "[[description]]/[[value]]",
        descriptionField: "townName",
        bullet: "round",
        bulletSizeField: "townSize",
        bulletBorderColor: "#F1C40F", //#786c56",
        bulletBorderAlpha: 1,
        bulletBorderThickness: 2,
        bulletColor: "#000000",
        labelText: "[[townName2]]",
        labelPosition: "right",
        balloonText: "온도:[[value]]",
        showBalloon: true,
        // animationPlayed: true,
    }],
    chartCursor: {
        zoomable: false,
        categoryBalloonDateFormat: "DD",
        cursorAlpha: 0,
        valueBalloonsEnabled: false
    },
    legend: {
        bulletType: "round",
        equalWidths: false,
        valueWidth: 120,
        useGraphSettings: true,
        color: "#FFFFFF"
    }
});