import React, { Component } from 'react';
import PropTypes from 'prop-types';
import isEqual from 'lodash/isEqual';
import '../css/Filters.css';
import { ReactComponent as ArrowIcon } from './arrow.svg';
import orderConfig from '../order-config.json';

class Filters extends Component {
  constructor(props) {
    super(props);
    this.state = {
      filters: [],
      isExpanded: false,
    };
  }

  shouldComponentUpdate(nextProps, nextState) {
    // Have the filters or have they been expanded (called by handleInputChange)
    const hasUpdatedFilters = !isEqual(nextState.filters, this.state.filters);
    // console.log("has up f: ", hasUpdatedFilters);
    const hasExpanded = nextState.isExpanded !== this.state.isExpanded;

    if (hasUpdatedFilters || hasExpanded) {
      this.props.filterData(nextState.filters);
      return true;
    } else {
      return false;
    }
  }

  render = () => {
    const { filters, isExpanded } = this.state;
    let hasFilters = filters.length > 0;
    const header = hasFilters ? `filters (${filters.length})` : `filters`;

    return (
      <div className={`filters ${isExpanded && "filters--open"}`}>
        <div className="filters__header" onClick={this.handleHeaderClick}>
          <h2 className="filters__title">{header}</h2>
          <ArrowIcon className="filters__icon"/>
          {hasFilters && <p className="filters__clear" onClick={this.clearFilters}>Clear filters</p>}
        </div>
        {/* Whenever you want a new group call in the structure below.
          The key to fetch all possibilities is passed into _getItems */}
        {isExpanded &&
          <div className="groups">
            <div className="group">
              <h3 className="group__title">Type of study</h3>
              <div className="group__list">
                {this._getItems("type")}
              </div>
            </div>
            <div className="group">
              <h3 className="group__title">Year of publication</h3>
              <div className="group__list">
              {this._getItems("yearGroup")}
              </div>
            </div>
            <div className="group">
              <h3 className="group__title">Outcomes</h3>
              <div className="group__list">
              {this._getItems("outcomes")}
              </div>
            </div>
            <div className="group">
              <h3 className="group__title">Study quality</h3>
              <div className="group__list">
              {this._getItems("quality")}
              </div>
            </div>
            <div className="group">
              <h3 className="group__title">Intervention type</h3>
              <div className="group__list">
              {this._getItems("interventionCategories")}
              </div>
            </div>
            <div className="group">
              <h3 className="group__title">Population groups</h3>
              <div className="group__list">
                {this._getItems("populationGroups")}
              </div>
            </div>
          </div>
        }
      </div>
    )
  }

  clearFilters = (e) => {
    e.stopPropagation();
    e.preventDefault();
    this.setState({
      filters: [],
    })
  }

  _getItems(property) {
    // Get items takes a key and then reurns a map of list items with that key.
    const { filters } = this.state;

    return this._getValueSet(property).map((value, i) => {
      // Value is just a text representation of the label

      // isActive just checks if the applied filters match the lis being generated
      // if so it marks it as active so it can be shown with a check
      const isActive = filters.map(filter => filter.value === value).includes(true);
      return (
        <label key={i}>
          <input
            name={property}
            value={value}
            type="checkbox"
            onChange={this.handleInputChange}
            checked={isActive}
          />
          {value}
        </label>
      );
    });
  }

  _getValueSet(key) {
    // Make a copy of all the raw data passed down
    const data = {...this.props.data};

    const valueSet = data.features.reduce((foundAccumulator, feature) => {
      // Goes through all the features and gets the value at key
      // Key would be something like type/
      const values = feature.properties[key];

      // If it's an array return it, if not put it in one
      const valueArr = Array.isArray(values) ? values : [values];

      // Loop over all values in arrays
      valueArr.forEach((value) => {
        // If the foundAccumulator array already includes the value do nothing, else add it
        const isNewValue = !foundAccumulator.includes(value);
        isNewValue && foundAccumulator.push(value);
      });
      return foundAccumulator;
    }, []);

    if (key in orderConfig){
      // If we have an order config for the key return them in that order,
      // be careful though as the values in the csv will have to match exactly
      return orderConfig[key];
    } else {
      return valueSet.filter(n => n).sort();
    }
  }

  handleHeaderClick = () => {
    // Set state so we expand the header
    this.setState({ isExpanded: !this.state.isExpanded});
  }

  handleInputChange = (event) => {
    const { name, value, checked } = event.target;
    let filters = [...this.state.filters]

    // The filter that was just checked
    const newFilter = {
      name: name,
      value: value
    }

    // We don't wanna allow more than one type or yearGroup filter
    // let removeArray = filters.filter((item) => (name !== "type" && name !== "yearGroup"));

    // let hasType = filters.some((item) => item.name === "type");
    // let hasYearGroup = filters.some((item) => item.name === "yearGroup");
    //
    // if (hasType && name === "type") {
    //   // Get rid of any old types if we have them in and new one is a type
    //   filters = filters.filter((item) => item.name !== "type");
    // }
    //
    // if (hasYearGroup && name === "yearGroup") {
    //   // Get rid of any old years if we have them in and new one is a year
    //   filters = filters.filter((item) => item.name !== "yearGroup");
    // }



    if(checked) {
      filters.push(newFilter);
    }

    if(!checked) {
      filters = filters.filter(filter => !isEqual(filter, newFilter));
    }

    // Finally update filters
    this.setState({ filters: filters });
  }
}

Filters.propTypes = {
  data: PropTypes.object.isRequired,
  filterData: PropTypes.func.isRequired
}

export default Filters;
