window.onscroll = function() {scrollHandler()};

var section1 = document.getElementById('section1');
var section2 = document.getElementById('section2');
var section3 = document.getElementById('section3');
var vis_div = document.getElementById('visualization')
function scrollHandler() {
	document.getElementById("rank-diagram").style.display = "none";
	document.getElementById("chord-diagram").style.display = "none";
	document.getElementById("chord-legend").style.display = "none";
	document.getElementById("linear-diagram").style.display = "none";

	if(section1.getBoundingClientRect().top - window.innerHeight < 0 && 
		section1.getBoundingClientRect().top + section1.getBoundingClientRect().height > 0
		){ // section 1
		document.getElementById("rank-diagram").style.display = "inline";
		if(section1.getBoundingClientRect().top < 0 &&
			section1.getBoundingClientRect().top + section1.getBoundingClientRect().height > window.innerHeight
			){
			vis_div.style.top = 0;
		}
		else if(section1.getBoundingClientRect().top + section1.getBoundingClientRect().height < window.innerHeight){
			vis_div.style.top = section1.getBoundingClientRect().top + section1.getBoundingClientRect().height - window.innerHeight;
		}
		else{
			vis_div.style.top = section1.getBoundingClientRect().top;
		}


		if(document.getElementById('sec1-1').getBoundingClientRect().top - window.innerHeight/2 < 0 &&
			document.getElementById('sec1-1').getBoundingClientRect().top + document.getElementById('sec1-1').getBoundingClientRect().height > 0
			){
			if(curr_index !== 26){
				curr_index = 26;
				updateRankHover();
			}
		} else if(document.getElementById('sec1-2').getBoundingClientRect().top - window.innerHeight/2 < 0 &&
			document.getElementById('sec1-2').getBoundingClientRect().top + document.getElementById('sec1-2').getBoundingClientRect().height > 0
			){
			if(curr_index !== 15){
				curr_index = 15;
				updateRankHover();
			}
		} else if(document.getElementById('sec1-3').getBoundingClientRect().top - window.innerHeight/2 < 0 &&
			document.getElementById('sec1-3').getBoundingClientRect().top + document.getElementById('sec1-3').getBoundingClientRect().height > 0
			){
			if(curr_index !== 6){
				curr_index = 6;
				updateRankHover();
			}
		}
	} else if(section2.getBoundingClientRect().top - window.innerHeight < 0 && 
		section2.getBoundingClientRect().top + section2.getBoundingClientRect().height > 0){
		document.getElementById("chord-diagram").style.display = "inline";
		document.getElementById("chord-legend").style.display = "inline";
		if(section2.getBoundingClientRect().top < 0 &&
			section2.getBoundingClientRect().top + section2.getBoundingClientRect().height > window.innerHeight
			){
			vis_div.style.top = 0;
		}
		else if(section2.getBoundingClientRect().top + section2.getBoundingClientRect().height < window.innerHeight){
			vis_div.style.top = section2.getBoundingClientRect().top + section2.getBoundingClientRect().height - window.innerHeight;
		}
		else{
			vis_div.style.top = section2.getBoundingClientRect().top;
		}


		if(document.getElementById('sec2-1').getBoundingClientRect().top - window.innerHeight/2 < 0 &&
			document.getElementById('sec2-1').getBoundingClientRect().top + document.getElementById('sec2-1').getBoundingClientRect().height > 0
			){
			if(curr_index !== 26){
				curr_index = 26;
				transition_chord();
			}
		} else if(document.getElementById('sec2-2').getBoundingClientRect().top - window.innerHeight/2 < 0 &&
			document.getElementById('sec2-2').getBoundingClientRect().top + document.getElementById('sec2-2').getBoundingClientRect().height > 0
			){
			if(curr_index !== 15){
				curr_index = 15;
				transition_chord();
			}
		} else if(document.getElementById('sec2-3').getBoundingClientRect().top - window.innerHeight/2 < 0 &&
			document.getElementById('sec2-3').getBoundingClientRect().top + document.getElementById('sec2-3').getBoundingClientRect().height > 0
			){
			if(curr_index !== 6){
				curr_index = 6;
				transition_chord();
			}
		}

	}


}