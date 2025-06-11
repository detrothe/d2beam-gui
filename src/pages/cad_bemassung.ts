import { CAD_BEMASSUNG_PARALLEL } from "./cad"
import { buttons_control, set_help_text } from "./cad_buttons"



//--------------------------------------------------------------------------------------------------------
export function Bemassung_parallel_button() {
  //----------------------------------------------------------------------------------------------------

  console.log("in Bemassung_parallel_button")

  //  let el = document.getElementById("id_cad_info_button") as HTMLButtonElement

  if (buttons_control.bemassung_aktiv) {
    buttons_control.reset()
  } else {
    buttons_control.reset()
    //  el.style.backgroundColor = 'darkRed'
    buttons_control.bemassung_aktiv = true
    buttons_control.cad_eingabe_aktiv = true
    buttons_control.typ_cad_element = CAD_BEMASSUNG_PARALLEL
    set_help_text('ersten Knoten picken');
    //el.addEventListener('keydown', keydown);
    buttons_control.n_input_points = 3
    buttons_control.button_pressed = true;


  }

}
