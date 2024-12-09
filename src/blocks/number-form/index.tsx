import edit from './edit';
import block from './block.json';
import { registerQueryFormBlock } from "../register-blocks";
import save from "../../save";

registerQueryFormBlock(block, edit, save)
