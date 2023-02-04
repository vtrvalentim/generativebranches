//TO-DOS
//
//UI
// gravar videos

// libs
const canvasSketch = require('canvas-sketch');
const math = require('canvas-sketch-util/math');
const random = require('canvas-sketch-util/random');
const colormap = require('colormap');
const Tweakpane = require('tweakpane');

//------------------------------------------------------------------------

// global variables

//UI Parameters
const params = {
  raio : 10,
  pontos : 7000,
  velocidadeX: 1.12,
  velocidadeY: 1.59,
  colorchange: 0.67,
  fork: 0.1685,
  color: 'jet',
  background: 'black',
  spin: false,
};

// color array
let nshades = 50;
let colors = colormap({ 
    colormap: params.color,
    nshades: nshades,
  });

// probabilities
let probcolor = params.colorchange; // probability of changing colors

// shape parameters
let pr = params.raio; // radius

// canvas 
const canvaswidth = 2620;
const canvasheight = 1480;
const settings = {
  dimensions: [ canvaswidth, canvasheight ],
  animate: true,
};

//--------------------------------------------------------------------------
// Functions
const sketch = ({ context, width, height }) => {


// frame variables
let startx = width * 0.5; // start x position
let starty = height * 0.5; // start y positiom

// point loc variables
let px = 0; // x coord offset
let py = 0; // y coord offset
let velx = pr * params.velocidadeX; // x velocity
let vely = pr * params.velocidadeY; // y velocity
let maxpoints = params.pontos//1500; // max number of points
let sumtotalpoints = 0; // point counter

// point array
let points = [
    new point({x: px,y: py, velx: velx, vely: vely, colorcount: 0})   
    ];

// paths array
let paths = [
  points
  ];

// probability variables
let probfork = params.fork;

//spinning rect toggle
let spinningrect = params.spin;

  return ({ context, width, height }) => {

    // background
    context.fillStyle = params.background;
    context.fillRect(0, 0, width, height);

    //canvas context
    context.save();
    context.translate(startx, starty);

    //update GUI variables
    colors = colormap({ 
      colormap: params.color,
      nshades: nshades,
    });
    spinningrect = params.spin;


    //loop through all paths
    paths.forEach(path =>{
         
      // if path is empty remove it from paths array
      if(path.length == 0){
        let idx = paths.indexOf(path);
        paths.splice(idx, 1);
        return
      };

      // create a fork on the current path
      if(params.fork > Math.random()){
        paths.push([createforkpoint(path[path.length-1])]);
        //console.log(path[path.length-1]);
      }

      // draw points
      if(spinningrect == false){
        path.forEach(point => {
          point.drawPoint({context: context});      
        })
      }

      // draw rectangles
      else{
        path.forEach(point => {
          point.drawRect({context: context});      
        })
      }
      // add next point to the array
      if (pr != params.raio){pr = params.raio};
      path.push(createnextpoint(path[path.length-1]));

      // count total amount of points 
      sumtotalpoints += path.length;
    })
    
    
    maxpoints = params.pontos;
    // check if total number of points is less than max, if yes remove last point
    if(sumtotalpoints >= maxpoints){  
      j = 0;
      for(i = 0; i <= (sumtotalpoints - maxpoints); i++){        
        if(paths[j].length > 0){
          paths[j].shift();  
        }
        else{
          j += 1;
          paths[j].shift();
        }    
      }
    }
    

    sumtotalpoints = 0;

    context.restore();

  };
};

class point {

  // Point constructor
  constructor({x, y, velx, vely, colorcount}){

    this.x = x;
    this.y = y;
    this.radius = pr;
    this.velx = velx;
    this.vely = vely;
    this.colorcount = colorcount;
    this.color = colors[colorcount];

  }

  // draw point
  drawPoint({context}){
    
    context.beginPath();
    context.arc(this.x, this.y, this.radius, 0, Math.PI * 2);  
    context.fillStyle = this.color;
    context.fill();
    context.closePath();

  }

  // draw rect
  drawRect({context}){


    //let angle = calculateangle(this.velx, this.vely);
    let angle = random.range(-3.1415,3.1415)

    context.beginPath();
    context.rotate(angle);
    context.fillStyle = this.color;
    context.fillRect(this.x, this.y, this.radius*4, this.radius);
    context.rotate(-angle);
    context.closePath();
    
  }

}

// Update point position + bounce
const createnextpoint = (currpoint) => {

  let  xnext, ynext, velxnext, velynext, colorcountnext;

  let paramsvelx = params.velocidadeX * params.raio;
  let paramsvely = params.velocidadeY * params.raio;

  //update vel to params value
  if(calculatehippotenuse(currpoint.velx,currpoint.vely) != calculatehippotenuse(paramsvelx,paramsvely)){
    currpoint.velx = Math.sign(currpoint.velx) * paramsvelx;
    currpoint.vely = Math.sign(currpoint.vely) * paramsvely;
  }

  // bounce vel if pos on canvas boundary
  if((Math.abs(currpoint.x) >= canvaswidth/2)&&(Math.sign(currpoint.x)==Math.sign(currpoint.velx))){
    velxnext = currpoint.velx * (-1)}
    else{velxnext = currpoint.velx};
  if((Math.abs(currpoint.y) >= canvasheight/2)&&(Math.sign(currpoint.y)==Math.sign(currpoint.vely))){
    velynext = currpoint.vely * (-1)}
    else(velynext = currpoint.vely);

  colorcountnext = currpoint.colorcount;

  // change color based on probability
  if(params.colorchange > Math.random()){
    if(currpoint.colorcount == nshades - 1){colorcountnext = 0}
    else{colorcountnext = currpoint.colorcount + 1;}
  }

  xnext = currpoint.x + velxnext;
  ynext = currpoint.y + velynext;

  return new point({x: xnext, y: ynext, velx: velxnext, vely: velynext, colorcount: colorcountnext});
}

// Create forked point
const createforkpoint = (currpoint) => {

  let xfork, yfork, velxfork, velyfork, colorcountfork;

  //update vel to params value
  //currpoint.velx = Math.sign(currpoint.velx) * params.velocidadeX * params.raio;
  //currpoint.vely = Math.sign(currpoint.vely) * params.velocidadeY * params.raio;
  //console.log('velx: '+currpoint.velx);
  //console.log('vely: '+currpoint.vely);

  [velxfork, velyfork] = calculatenewvelocity(currpoint.velx, currpoint.vely);
  //console.log('velxfork: '+velxfork);
  //console.log('velyfork: '+velyfork)
  let testangle = calculateangle(currpoint.velx, currpoint.vely);
  //console.log(testangle);

  xfork = currpoint.x + velxfork;
  yfork = currpoint.y + velyfork;

  colorcountfork = currpoint.colorcount;

  // change color based on probability
  if(params.colorchange > Math.random()){
    if(currpoint.colorcount == nshades-1){colorcountfork = 0}
    else{colorcountfork = currpoint.colorcount + 1;}
  }

  return new point({x: xfork, y: yfork, radius: currpoint.radius, velx: velxfork, vely: velyfork, colorcount: colorcountfork});
}

// calculate vx and vy after angle change in velocity
const calculatenewvelocity = (vx, vy) => {

  let hippotenuse = Math.sqrt((vx*vx)+(vy*vy)); // calculate current velocity magnitude
  //console.log('hippotenuse:' + hippotenuse);
  let theta = Math.asin(vy/hippotenuse); // calulate current velocity angle
  //console.log('theta: '+theta);
  let gamma = theta + random.range(-3.1415,3.1415); //change angle randomly by min and max radians using 3.1415 to optmize computation
  //console.log('gamma: '+gamma);
  let vxnew = Math.cos(gamma) * hippotenuse; // calculate new vx
  //console.log('vxnew: '+vxnew);
  let vynew = Math.sin(gamma) * hippotenuse; // calculate new vy
  //console.log('vynew: '+vynew);
  
  return [vxnew, vynew];
}

// calculate angular velocity
const calculateangle = (vx,vy) => {

  let hippotenuse = Math.sqrt((vx*vx)+(vy*vy)); // calculate current velocity magnitude
  let angle = Math.asin(vy/hippotenuse); // calulate current velocity angle
  //console.log(angle)
  return angle;
}

// calculate hipotenuse
const calculatehippotenuse = (vx,vy) => {

  let hippotenuse = Math.sqrt((vx*vx)+(vy*vy)); // calculate current velocity magnitude
  
  return hippotenuse;
}

// UI
const createPane = () => {
  const pane = new Tweakpane.Pane({title: 'Customize o algoritimo'});
  let colorfolder, pointfolder, probfolder;

  // create folders
  colorfolder = pane.addFolder({title: 'Cores'});
  pointfolder = pane.addFolder({title: 'Pontos'});
  probfolder = pane.addFolder({title: 'Probabilidades'});

  // add elements to folders
  //color
  colorfolder.addInput(params, 'color', {options: 
    {rainbow: 'rainbow', 
    oxygen: 'oxygen', 
    phase: 'phase', 
    jet: 'jet',
    cool: 'cool',
    autumn: 'autumn',
  }});
  colorfolder.addInput(params, 'background', {options: 
    {black: 'black', 
    white: 'white',
  }});
  //point
  pointfolder.addInput(params, 'raio',{min: 1, max: 150, step: 1});
  pointfolder.addInput(params, 'pontos',{min: 5, max: 12000, step: 5});
  pointfolder.addInput(params, 'velocidadeX',{min: 0.1, max: 5});
  pointfolder.addInput(params, 'velocidadeY',{min: 0.1, max: 5});
  //prob
  probfolder.addInput(params, 'colorchange',{min: 0.01, max: 1});
  probfolder.addInput(params, 'fork',{min: 0, max: 0.5, step: 0.0001});
  probfolder.addInput(params, 'spin');

}

createPane();
canvasSketch(sketch, settings);

