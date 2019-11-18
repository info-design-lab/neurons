window.onscroll = function() {scrollHandler()};

var section1 = document.getElementById('section1');
var section2 = document.getElementById('section2');
var section3 = document.getElementById('section3');
var section4 = document.getElementById('section4');
var vis_div = document.getElementById('visualization');

function scrollHandler() {

	if(section4.getBoundingClientRect().top - window.innerHeight < 0){
		makeVisibile(["rank-diagram", "chord-diagram", "chord-legend", "chord-image", "linear-diagram", "chord-checkbox"]);
		if(document.getElementById("visualization").style.position !== "relative"){
			document.getElementById("visualization").style.position = "relative";
		}
		vis_div.style.opacity = 1;
	} else if(section1.getBoundingClientRect().top - window.innerHeight < 0 && 
		section1.getBoundingClientRect().top + section1.getBoundingClientRect().height > 0
		){ // section 1

		if(document.getElementById("visualization").style.position !== "fixed"){
			document.getElementById("visualization").style.position = "fixed";
		}

		makeVisibile(["rank-diagram"]);
		if(section1.getBoundingClientRect().top < 0 &&
			section1.getBoundingClientRect().top + section1.getBoundingClientRect().height > window.innerHeight
			){
			vis_div.style.opacity = 1;
		}
		else if(section1.getBoundingClientRect().top + section1.getBoundingClientRect().height < window.innerHeight){
			vis_div.style.opacity = (section1.getBoundingClientRect().top + section1.getBoundingClientRect().height)/window.innerHeight - 0.5;
		}
		else{
			vis_div.style.opacity = 1 - section1.getBoundingClientRect().top/window.innerHeight;
		}

		if(document.getElementById('sec1-1').getBoundingClientRect().top - window.innerHeight/2 < 0 &&
			document.getElementById('sec1-1').getBoundingClientRect().top + document.getElementById('sec1-1').getBoundingClientRect().height > 0
			){
			if(rank_hover_index !== 0){
				rank_hover_index = 0;
				updateRankHover(1000);
			}
		} else if(document.getElementById('sec1-2').getBoundingClientRect().top - window.innerHeight/2 < 0 &&
			document.getElementById('sec1-2').getBoundingClientRect().top + document.getElementById('sec1-2').getBoundingClientRect().height > 0
			){

			// if(rank_hover_index !== 15){
			// 	rank_hover_index = 15;
			// 	updateRankHover(1000);
			// }

		} else if(document.getElementById('sec1-3').getBoundingClientRect().top - window.innerHeight/2 < 0 &&
			document.getElementById('sec1-3').getBoundingClientRect().top + document.getElementById('sec1-3').getBoundingClientRect().height > 0
			){
			if(rank_hover_index !== 22){
				rank_hover_index = 22;
				updateRankHover(1000);
			}
		}
	} else if(section2.getBoundingClientRect().top - window.innerHeight < 0 && 
		section2.getBoundingClientRect().top + section2.getBoundingClientRect().height > 0){
		makeVisibile(["chord-diagram", "chord-legend", "chord-image", "chord-checkbox", "linear-diagram"]);

		if(document.getElementById("visualization").style.position !== "fixed"){
			document.getElementById("visualization").style.position = "fixed";
		}

		if(section2.getBoundingClientRect().top < 0 &&
			section2.getBoundingClientRect().top + section2.getBoundingClientRect().height > window.innerHeight
			){
			vis_div.style.opacity = 1;
		}
		else if(section2.getBoundingClientRect().top + section2.getBoundingClientRect().height < window.innerHeight){
			vis_div.style.opacity = (section2.getBoundingClientRect().top + section2.getBoundingClientRect().height)/window.innerHeight - 0.5;
		}
		else{
			vis_div.style.opacity = 1 - section2.getBoundingClientRect().top/window.innerHeight;
		}

		if(document.getElementById('sec2-1').getBoundingClientRect().top - window.innerHeight/2 < 0 &&
			document.getElementById('sec2-1').getBoundingClientRect().top + document.getElementById('sec2-1').getBoundingClientRect().height > 0
			){
			if(curr_index !== -1){
				d3.select("#circle_" + curr_index).style('stroke', 'transparent');
				curr_index = -1;
				transition_chord();
			}
		} else if(document.getElementById('sec2-2').getBoundingClientRect().top - window.innerHeight/2 < 0 &&
			document.getElementById('sec2-2').getBoundingClientRect().top + document.getElementById('sec2-2').getBoundingClientRect().height > 0
			){
			if(curr_index !== 6){
				d3.select("#circle_" + curr_index).style('stroke', 'transparent');
				curr_index = 6;
				transition_chord();
			}
		}
	}
}

function makeVisibile(elements){
	var element_list = ["rank-diagram", "chord-diagram", "chord-image", "chord-legend", "linear-diagram", "chord-checkbox"];
	for(var i in element_list){
		if(elements.indexOf(element_list[i]) < 0){
			if(document.getElementById(element_list[i]).style.display !== "none"){
				document.getElementById(element_list[i]).style.display = "none";
			}
		} else{
			if(document.getElementById(element_list[i]).style.display !== "inline"){
				document.getElementById(element_list[i]).style.display = "inline";
			}
		}
	}
}