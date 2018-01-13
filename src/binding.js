import React from 'react';
export const bindWithStore = ( Component) => {
    let {store} = this.props;
    let initialValue=store;
    let binder_arr = this.props.bind.split('.');
    binder_arr.forEach( key =>{
        initialValue = initialValue[key];
    })

    if(typeof Component=='string'){
       return handleDomComponents(Component)
    }
}


const handleDomComponents = (Component) =>{
    if(Component=='input'){
        return  React.createElement('input',{
                ...this.props,
                type : 'text',
                value : initialValue,
                onChange : (e) => store.set(this.props.bind, e.target.value)
            })
        
    }
       
}