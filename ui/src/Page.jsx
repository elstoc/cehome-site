import React from 'react';

//import Contents from './Contents.jsx';

function Contents() {
  return (
    <div>This is the contents</div>
  );
}

function ComponentNav({children}) {
  let returnData = [];
  children.forEach((item) => {
    if(item.children === undefined) {
      returnData.push(
        <li>{item.title}</li>
      );
    } else {
      returnData.push(
        <li>{item.title}
          <ul>
            <ComponentNav children={item.children} />
          </ul>
        </li>
      );
    }
  });
  return returnData;
}

class NavBar extends React.Component {
  constructor() {
    super();
    this.state = {};
  }

  componentDidMount() {
    this.loadData();
  }

  async loadData() {
    const response = await fetch('/api/components');
    const dirs = await response.json();
    this.setState(dirs);
  }

  render() {
    let { children } = this.state;
    if(children !== undefined) {
      return (
        <div className="navbar">
          <ul>
            <ComponentNav children={children} />
          </ul>
        </div>
      );
    }
  }
}

function Footer() {
  return (
    <div>This is the footer</div>
  );
}

export default function Page() {
  return (
    <div>
      <NavBar />
      <Contents />
      <Footer />
    </div>
  );
}
