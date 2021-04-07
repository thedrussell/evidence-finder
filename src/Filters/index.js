import React, { Component } from 'react';
import PropTypes from 'prop-types';
import isEqual from 'lodash/isEqual';
import '../css/Filters.css';
import { ReactComponent as ArrowIcon } from './arrow.svg';

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
    const hasUpdatedFilters = nextState.filters.length !== this.state.filters.length;
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
    const header = filters.length ? `filters (${filters.length})` : `filters`;

    return (
      <div className={`filters ${isExpanded && "filters--open"}`}>
        <div className="filters__header" onClick={this.handleHeaderClick}>
          <h2 className="filters__title">{header}</h2>
          <ArrowIcon className="filters__icon"/>
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
              {this._getItems("year")}
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

    const valueSet = data.features.reduce((found, feature) => {
      // Goes through all the features and gets the value at key
      const values = feature.properties[key];

      // If it's an array return it, if not put it in one
      const valueArr = Array.isArray(values) ? values : [values];

      // Loop over all values in arrays
      valueArr.forEach((value) => {
        // If the found array already includes the value do nothing, else add it
        const isNewValue = !found.includes(value);
        isNewValue && found.push(value);
      });

      return found;
    }, []);

    // Returns array of values for that particular group.
    return valueSet.filter(n => n).sort();
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

    if(checked) {
      filters.push(newFilter);
    }

    if(!checked) {
      filters = filters.filter(filter => !isEqual(filter, newFilter));
    }

    // Finally update filters
    this.setState({ filters });
  }
}

Filters.propTypes = {
  data: PropTypes.object.isRequired,
  filterData: PropTypes.func.isRequired
}

export default Filters;
