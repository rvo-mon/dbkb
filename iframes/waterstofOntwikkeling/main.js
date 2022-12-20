let width = 1140
let height = 780

var currentId
let colorPointer = 0

let excelInput

var map = L.map('map', {minZoom: 8, maxZoom: 8,scrollWheelZoom: false, attributionControl: false, zoomControl: false }).setView([52.1734979, 5.2943227], 8)
// Disable dragging when user's cursor enters the element

d3.select('#overlay').append('svg')
  .style('width', width + 'px')
  .style('height', height + 'px')
  // .style('background-color', 'red')
  .attr('id', 'bubblesSVG')

drawMap()
function drawMap () {
  var svg = d3.select(map.getPanes().overlayPane).append('svg').style('background-color', 'none').attr('id', 'mapSVG'),
    g = svg.append('g').attr('class', 'leaflet-zoom-hide')

  d3.json('NLsolid.geojson').then(function (data) {
    // if (error) throw error

    var transform = d3.geoTransform({ point: projectPoint }),
      path = d3.geoPath().projection(transform)

    var feature = g.selectAll('path')
      .data(data.features)
      .enter().append('path')

    map.on('viewreset', reset)
    map.on('zoom', reset)
    reset()

    // Reposition the SVG to cover the features.
    function reset () {
      var bounds = path.bounds(data),
        topLeft = bounds[0],
        bottomRight = bounds[1]

      svg.attr('width', bottomRight[0] - topLeft[0])
        .attr('height', bottomRight[1] - topLeft[1])
        .style('left', topLeft[0] + 'px')
        .style('top', topLeft[1] + 'px')
      let xpos = -topLeft[0]
      let ypos = -topLeft[1]
      g.attr('transform', 'translate(' + xpos + ',' + ypos + ')')

      feature.attr('d', path).attr('fill', '#888')
    }

    // Use Leaflet to implement a D3 geometric transformation.
    function projectPoint (x, y) {
      var point = map.latLngToLayerPoint(new L.LatLng(y, x))
      this.stream.point(point.x, point.y)
    }

    var req = new XMLHttpRequest()
    req.open('GET', 'input.xlsx', true)
    req.responseType = 'arraybuffer'
    req.onload = function (e) {
      // console.log(req.response)
      var workbook = XLSX.read(req.response)
      excelInput = XLSX.utils.sheet_to_json(workbook.Sheets['Sheet1'])
      drawGraphElements()
      drawBubbleChart()
    }
    req.send()
  })
  var geojsonLayer = new L.GeoJSON.AJAX('nettest4.geojson', { style: styleFunction })
  geojsonLayer.addTo(map)

  function styleFunction () {
    return { color: '#6effff', stroke: true, weight: 2, opacity: 0.9, dashArray: '2 5' }
  }


  let zwaartepunten = []

  function drawGraphElements () {
    var svg = d3.select('#bubblesSVG')

    let spacing = 5
    let r = 40
    let fases = ['fase0', 'fase1', 'fase2', 'fase3']
    let cat = ['productie', 'vraag', 'opslag', 'import']
    for (i = 0;i < fases.length;i++) {
      for (k = 0;k < fases.length;k++) {
        svg.append('circle')
          .attr('fill', '#FFF')
          .style('opacity', 0.1)
          .attr('r', r)
          .attr('cy', 180 + (k * ((r * 2) + spacing))).attr('cx', 180 + i * (r * 2 + spacing))
        console.log(cat[i] + ' ' + fases[k])
        zwaartepunten.push({id: cat[i] + '_' + fases[k], y: 180 + i * (r * 2 + spacing), x: 180 + (k * ((r * 2) + spacing))})
      }
    }
    for (i = 0;i < fases.length;i++) {
      svg.append('text')
        .attr('x', 140 + i * (r * 2 + spacing) + r)
        .attr('y', 120)
        .attr('fill', 'white')
        .style('font-weight', 200)
        .style('text-anchor', 'middle')
        .text('Fase ' + i)
    }

    svg.append('text')
      .attr('x', 612)
      .attr('y', 120)
      .attr('fill', 'white')
      .style('font-weight', 200)
      .style('text-anchor', 'start')
      .text('Gerealiseerd')

    svg.append('text')
      .attr('x', 40)
      .attr('y', 40)
      .style('font-size', '20px')
      .attr('fill', '#ccc')
      .style('font-weight', 200)
      .style('text-anchor', 'start')
      .text('Routekaart Waterstof')

    svg.append('text')
      .attr('x', 160)
      .attr('y', 80)
      .attr('fill', 'white')
      .style('font-size', '15px')
      .style('font-weight', 200)
      .style('text-anchor', 'start')
      .text('Projectenpijplijn')

    svg.append('line')
      .attr('x1', 160).attr('x2', 300)
      .attr('y1', 95).attr('y2', 95)
      .attr('stroke', 'white')

    svg.append('text')
      .attr('x', 40)
      .attr('y', 110)
      .attr('fill', 'white')
      .style('font-weight', 200)
      .style('text-anchor', 'start')
      .style('font-size', '40px')
      .text('2022')
      .attr('id', 'yearIndicator')

    let text = ['Productie', 'Vraag', 'Opslag', 'Import']
    for (i = 0;i < text.length;i++) {
      svg.append('text')
        .attr('x', 120)
        .attr('y', 140 + i * (r * 2 + spacing) + r)
        .attr('fill', 'white')
        .style('font-weight', 200)
        .style('font-size', '15px')
        .style('text-anchor', 'end')
        .text(text[i])
    }
    console.log(zwaartepunten)

    let provicieCirkels = [
      {naam: 'Noord-Holland',id: 'NH', x: 738, y: 305},
      {naam: 'Zuid-Holland',id: 'ZH', x: 695, y: 402},
      {naam: 'Zeeland',id: 'ZE', x: 646, y: 498},
      {naam: 'Utrecht',id: 'UT', x: 787, y: 390},
      {naam: 'Gelderland',id: 'GL', x: 876, y: 419},
      {naam: 'Drenthe',id: 'DR', x: 947, y: 252},
      {naam: 'Fryslan',id: 'FR', x: 863, y: 210},
      {naam: 'Overijssel',id: 'OV', x: 921, y: 338},
      {naam: 'Limburg',id: 'LB', x: 860, y: 560},
      {naam: 'Noord-Brabant',id: 'NB', x: 769, y: 477},
      {naam: 'Groningen',id: 'GR', x: 941, y: 159},
      {naam: 'Flevoland',id: 'FL', x: 832, y: 313},
      {naam: 'Noordzee',id: 'NZ', x: 661, y: 208}

    ]
    for (i = 0;i < provicieCirkels.length;i++) {
      svg.append('circle')
        .attr('cx', provicieCirkels[i].x)
        .attr('cy', provicieCirkels[i].y)
        .attr('r', 40)
        .attr('fill', 'white')
        .style('opacity', 0.1)

      svg.append('rect')
        .attr('x', provicieCirkels[i].x - 38)
        .attr('y', provicieCirkels[i].y - 38)
        .attr('fill', '#bbb')
        .style('opacity', 1)
        .attr('rx', 5)
        .attr('ry', 5)
        .attr('height', 20)
        .attr('width', 20)

      svg.append('text')
        .attr('x', provicieCirkels[i].x - 38 + 10)
        .attr('y', provicieCirkels[i].y - 38 + 15)
        .attr('fill', '#333')
        .style('opacity', 1)
        .style('font-weight', 100)
        .style('font-size', '13px')
        .style('text-anchor', 'middle')
        .text(provicieCirkels[i].id)

      zwaartepunten.push({id: provicieCirkels[i].id, y: provicieCirkels[i].y, x: provicieCirkels[i].x})
    }

    let invoerUitvoer = [
      {naam: ' ⇆ Statenzijl',anchor: 'start', x: 1035, y: 212},
      {naam: ' ⇆ Vlieghuis',anchor: 'start', x: 972, y: 311},
      {naam: ' ⇆ Winterswijk',anchor: 'start', x: 982, y: 399},
      {naam: ' ⇆ Zevenaar',anchor: 'start', x: 917, y: 459},
      {naam: 'Dilsen ⇆ ',anchor: 'end', x: 824, y: 629},
      {naam: ' ⇆ Hilv.beek',anchor: 'middle', x: 790, y: 555},
      {naam: ' ⇆ Zandvliet',anchor: 'start', x: 690, y: 546},
      {naam: 'Sas van Gent  ⇆ ',anchor: 'end', x: 659, y: 568}
    ]

    for (i = 0;i < invoerUitvoer.length;i++) {
      svg.append('text')
        .attr('x', invoerUitvoer[i].x)
        .attr('y', invoerUitvoer[i].y)
        .attr('fill', '#ccc')
        .style('opacity', 1)
        .style('font-weight', 100)
        .style('font-size', '12px')
        .style('text-anchor', invoerUitvoer[i].anchor)
        .html(invoerUitvoer[i].naam)
    }
  }

  const eleSvg = document.querySelector('#bubblesSVG')
  eleSvg.addEventListener('mousedown', ({clientX, clientY}) => {
    let point = eleSvg.createSVGPoint()
    posx = clientX - 200
    posy = clientY - 20
    console.log('x: ' + posx)
    console.log('y: ' + posy)
    point.x = clientX // 0
    point.y = clientY // 0
  })

  function drawBubbleChart () {

    // append the svg object to the body of the page
    var svg = d3.select('#bubblesSVG')

    // create dummy data -> just one element per circle
    // var data = [
    //   { 'name': 'GZI Next', 'group': 1, 'value': 1.5 },
    //   { 'name': 'H2-based residential area in Van der Veen', 'group': 1, 'value': 0 },
    //   { 'name': 'Ameland', 'group': 1, 'value': 0 },
    //   { 'name': 'Hydrogenpilot Oosterwolde', 'group': 1, 'value': 0.2 },
    //   { 'name': 'H₂ Air Base Leeuwarden', 'group': 1, 'value': 0.9 },
    //   { 'name': 'Alliander Oosterwolde - solar park of GroenLeven', 'group': 1, 'value': 0.2 },
    //   { 'name': 'GldH2', 'group': 1, 'value': 0.3 },
    //   { 'name': 'Cyrus Smith', 'group': 1, 'value': 0 },
    //   { 'name': 'P2P IPKW', 'group': 1, 'value': 0.2 },
    //   { 'name': 'DNV Kema/DNV GL', 'group': 1, 'value': 0 },
    //   { 'name': 'Hystock (EnergyStock)', 'group': 1, 'value': 0.2 },
    //   { 'name': 'DJEWELS Chemiepark - Delfzijl, Phase 1', 'group': 1, 'value': 3.4 },
    //   { 'name': 'DJEWELS Chemiepark - Delfzijl, Phase 2', 'group': 1, 'value': 6.9 },
    //   { 'name': 'WAviatER', 'group': 1, 'value': 0 },
    //   { 'name': 'HyNetherlands, 1st phase', 'group': 1, 'value': 17.3 },
    //   { 'name': 'Hydrogen Plant for Westereems Wind Farm (RWE Eemshaven)', 'group': 1, 'value': 0.9 },
    //   { 'name': 'Energiepark Eemshaven West (phase I)', 'group': 1, 'value': 1.7 },
    //   { 'name': 'VoltH2 - Delfzijl', 'group': 1, 'value': 8.7 },
    //   { 'name': 'NortH2, phase 1', 'group': 1, 'value': 173.3 },
    //   { 'name': 'Energiepark Eemshaven West (phase II)', 'group': 1, 'value': 17.3 },
    //   { 'name': 'HyNetherlands 2nd phase', 'group': 1, 'value': 155.9 },
    //   { 'name': 'DJEWELS Chemiepark - Delfzijl, Phase 3', 'group': 1, 'value': 6.9 },
    //   { 'name': 'NortH2, phase 2', 'group': 1, 'value': 519.8 },
    //   // { "name": "NortH2, phase 3", "group": 3, "value": 1212.8 },
    //   { 'name': 'BrigH2', 'group': 1, 'value': 13.1 },
    //   { 'name': 'FUREC', 'group': 1, 'value': 0 },
    //   { 'name': 'GreenH2UB (1st hub, Noord Brabant)', 'group': 1, 'value': 0.9 },
    //   { 'name': 'GreenH2UB (10 hubs of 3-10MW, the first one Ref786)', 'group': 1, 'value': 16.5 },
    //   { 'name': 'HyFLEET:CUTE, Amesterdam', 'group': 1, 'value': 0 },
    //   { 'name': 'Duwaal', 'group': 1, 'value': 0.3 },
    //   { 'name': 'Hydrogen Mill', 'group': 1, 'value': 0.3 },
    //   { 'name': 'Hemweg hub Amsterdam', 'group': 1, 'value': 1.7 },
    //   { 'name': 'H2ermes', 'group': 1, 'value': 17.3 },
    //   { 'name': 'H2-gateway', 'group': 1, 'value': 0.2 },
    //   { 'name': 'H2M', 'group': 1, 'value': 0 },
    //   { 'name': 'Synkero synfuels project', 'group': 1, 'value': 17.3 },
    //   { 'name': 'H2era', 'group': 1, 'value': 86.6 },
    //   { 'name': 'Bio Energy Netherlands', 'group': 1, 'value': 0 },
    //   { 'name': 'Blue Hydrogen Den Helder', 'group': 1, 'value': 0 },
    //   { 'name': 'Hysolar Green on Road - Nieuwegein', 'group': 1, 'value': 0.3 },
    //   { 'name': 'PosHYdon', 'group': 1, 'value': 0.2 },
    //   { 'name': 'H2opZee', 'group': 1, 'value': 69.3 },
    //   { 'name': 'North Sea Wind Power Hub', 'group': 1, 'value': 328.5 },
    //   { 'name': 'Vlissingen - VoltH2 - phase I', 'group': 1, 'value': 4.3 },
    //   { 'name': 'Deltaurus 1', 'group': 1, 'value': 26.0 },
    //   { 'name': 'ELYgator', 'group': 1, 'value': 34.7 },
    //   { 'name': 'Yara Sluiskil (Deltaurus 2) - Haddock', 'group': 1, 'value': 17.3 },
    //   { 'name': 'Zeeland Refinery', 'group': 1, 'value': 26.0 },
    //   { 'name': 'Deltaurus 3', 'group': 1, 'value': 121.3 },
    //   { 'name': 'SeaH2Land', 'group': 1, 'value': 155.9 },
    //   { 'name': 'Hydrogen Delta - Zeeland', 'group': 1, 'value': 155.9 },
    //   { 'name': 'Terneuzen - VoltH2 - phase II', 'group': 1, 'value': 8.7 },
    //   { 'name': 'Vlissingen - VoltH2 - phase II', 'group': 1, 'value': 13.0 },
    //   { 'name': 'Terneuzen - VoltH2 - phase I', 'group': 1, 'value': 4.3 },
    //   { 'name': 'Zeeland Refinery CCS', 'group': 1, 'value': 0 },
    //   // { "name": "Shell heavy residue gasification CCU - Pernis refinery (in 2024, the CCU project will become CCUS - ref1323 - once Porhtos project is available)", "group": 3, "value": 1000 },
    //   { 'name': 'Rozenburg Power2Gas Phase 1', 'group': 1, 'value': 0 },
    //   { 'name': 'Rozenburg Power2Gas Phase 2', 'group': 1, 'value': 0 },
    //   { 'name': 'H2GO - 1st phase', 'group': 1, 'value': 0.3 },
    //   { 'name': 'Multiphly', 'group': 1, 'value': 0.5 },
    //   { 'name': 'AMpHytrite demonstrator, Port of Rotterdam, phase 1', 'group': 1, 'value': 0 },
    //   // { 'name': 'Shell heavy residue gasification CCUS - Pernis refinery ', 'group': 1, 'value': 1000 },
    //   { 'name': 'Air Liquide Botlek Rotterdam refinery (Porthos CCS)', 'group': 1, 'value': 0 },
    //   { 'name': 'Air Products Botlek Rotterdam refinery (Porthos CCS)', 'group': 1, 'value': 0 },
    //   { 'name': 'Exxobmobil Benelux Botlek Rotterdam refinery (Porthos CCS)', 'group': 1, 'value': 0 },
    //   { 'name': 'Port of Rotterdam BP refinery - H2.50', 'group': 1, 'value': 43.3 },
    //   { 'name': 'Curthyl', 'group': 1, 'value': 17.3 },
    //   { 'name': 'Uniper Maasvlakte, phase I', 'group': 1, 'value': 17.3 },
    //   { 'name': 'Holland Hydrogen - phase 1', 'group': 1, 'value': 34.7 },
    //   { 'name': 'H-Vision (phase 1)', 'group': 1, 'value': 100 },
    //   { 'name': 'Holland Hydrogen - phase 2', 'group': 13, 'value': 34.7 },
    //   { 'name': 'H2GO - 2nd phase', 'group': 1, 'value': 4.1 },
    //   { 'name': 'H-Vision (phase 2)', 'group': 1, 'value': 200 },
    //   { 'name': 'E-Thor', 'group': 1, 'value': 0.9 },
    //   { 'name': "Producing Hydrogen by Gasification of Biomass in 'het Groene Hart'", 'group': 1, 'value': 0 },
    //   { 'name': 'Uniper Maasvlakte, phase II', 'group': 1, 'value': 69.3 },
    //   { 'name': 'Zenid Initiative', 'group': 1, 'value': 0 },
    //   { 'name': 'AMpHytrite demonstrator, Port of Rotterdam, phase 1', 'group': 1, 'value': 0 }
    // ]

    console.log(excelInput)

    let data = []
    for (i = 0;i < excelInput.length;i++) {
      data.push({'name': excelInput[i].naam, 'group': excelInput[i].p2022, 'value': excelInput[i].waarde})
    }

    // A scale that gives a X target position for each group

    let domain = []
    let xvalues = []
    let yvalues = []
    for (i = 0;i < zwaartepunten.length;i++) {
      domain.push(zwaartepunten[i].id)
      xvalues.push(zwaartepunten[i].x)
      yvalues.push(zwaartepunten[i].y)
    }
    console.log(xvalues)

    var x = d3.scaleOrdinal()
      .domain(domain)
      .range(xvalues)

    var y = d3.scaleOrdinal()
      .domain(domain)
      .range(yvalues)

    // A color scale
    let color_productie = '#ec407a'
    let color_vraag = '#81C8A6'
    let color_opslag = 'white'
    let color_import = '#9BC6E5'
    var color = d3.scaleOrdinal()
      .domain(domain)
      .range([color_productie, color_productie, color_productie, color_productie, color_vraag, color_vraag, color_vraag, color_vraag, color_opslag, color_opslag, color_opslag, color_opslag, color_import, color_import, color_import, color_import  ])

    let scale = 0.05
    // Initialize the circle: all located at the center of the svg area
    var node = svg.append('g')
      .selectAll('circle')
      .data(data)
      .enter()
      .append('circle')
      .attr('r', function (d, i) { return d.value * scale })
      .attr('cx', 0)
      .attr('cy', 0)
      .style('fill', function (d) { return color(d.group) })
      .style('fill-opacity', 0.8)
      // .attr('stroke', function (d) { return color(d.group) })
      .attr('stroke', 'white')
      .style('stroke-width', 1)
      .call(d3.drag() // call specific function when circle is dragged
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended))

    // Features of the forces applied to the nodes:

    var simulation = d3.forceSimulation()
      .force('x', d3.forceX().strength(1).x(function (d) { return x(d.group) }))
      .force('y', d3.forceY().strength(1).y(function (d) { return y(d.group) }))
      // .force("center", d3.forceCenter().x(width / 2).y(500)) // Attraction to the center of the svg area
      // .force("charge", d3.forceManyBody().strength(1)) // Nodes are attracted one each other of value is > 0
      .force('collide', d3.forceCollide().strength(1).radius(function (d, i) { return d.value * scale + 2 }).iterations(1)) // Force that avoids circle overlapping

    // Apply these forces to the nodes and update their positions.
    // Once the force algorithm is happy with positions ('alpha' value is low enough), simulations will stop.
    simulation
      .nodes(data)
      .on('tick', function (d) {
        node
          .attr('cx', function (d) { return d.x; })
          .attr('cy', function (d) { return d.y; })
      })

    function getRandomInt (min, max) {
      min = Math.ceil(min)
      max = Math.floor(max)
      return Math.floor(Math.random() * (max - min) + min) // The maximum is exclusive and the minimum is inclusive
    }

    let positions = ['p2022', 'p2022', 'p2023', 'p2024', 'p2025', 'p2026', 'p2027', 'p2028', 'p2029', 'p2030', 'p2031', 'p2032']
    let currentPosition = 0
    setInterval(() => {

      if ((currentPosition + 2) > positions.length) {
        currentPosition = 0
      } else {currentPosition++}

      for (i = 0;i < data.length;i++) {
        data[i].group = excelInput[i][positions[currentPosition]]
      }
      console.log(currentPosition)
      console.log(positions[currentPosition])

      d3.select('#yearIndicator').text(positions[currentPosition].slice(1))

      simulation
        .nodes(data)
        .on('tick', function (d) {
          node
            .attr('cx', function (d) { return d.x; })
            .attr('cy', function (d) { return d.y; })
        })
    }, 2000)

    let cntr = 0
    setInterval(() => {
      if (cntr < 2) {
        simulation.alphaTarget(.03).restart()
        cntr++
      }
    }, 1000)

    // What happens when a circle is dragged?
    function dragstarted (d) {
      if (!d3.event.active) simulation.alphaTarget(.03).restart()
      d.fx = d.x
      d.fy = d.y
    }
    function dragged (d) {
      d.fx = d3.event.x
      d.fy = d3.event.y
    }
    function dragended (d) {
      if (!d3.event.active) simulation.alphaTarget(.03)
      d.fx = null
      d.fy = null
    }
  }
}