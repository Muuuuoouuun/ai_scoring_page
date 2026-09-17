import type {ComponentProps} from 'react';
/** Use browser navigation so links remain functional before hydration and in the Worker build. */
export default function Link(props:ComponentProps<'a'>){return <a {...props}/>;}
