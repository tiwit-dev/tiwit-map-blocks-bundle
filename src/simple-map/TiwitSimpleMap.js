/**
 * BLOCK: tiwit-map-blocks-bundle
 *
 * Registering a basic block with Gutenberg.
 * Simple block, renders and saves the same content without any interactivity.
 */

//  Import CSS.
import L from 'leaflet';

const { Component, Fragment } = wp.element

const { __ } = wp.i18n; // Import __() from wp.i18n

const {
	InspectorControls,
} = wp.editor

const {
	PanelBody,
	TextControl,
	TextareaControl,
	RangeControl,
	Button,
	Notice,
} = wp.components


class TiwitSimpleMap extends Component {

	constructor() {
		super( ...arguments );

		this.changeUserAddress = this.changeUserAddress.bind( this );
		this.getLatLongFromAddress = this.getLatLongFromAddress.bind( this );
		this.changePopupContent = this.changePopupContent.bind( this );

		this.mapRef = React.createRef();

		this.state = {
			map : null,
			isWaitingForNominatim : false,
			nominatimReturnEmpty : false
		}
	}

	componentDidMount(){

		this.displayMap()

	}


	componentDidUpdate( prevProps ) {

		if( this.props.attributes.lat &&
			(
				this.props.attributes.lat !== prevProps.attributes.lat ||
				this.props.attributes.lon !== prevProps.attributes.lon ||
				this.props.attributes.popup !== prevProps.attributes.popup ||
				this.props.attributes.zoom !== prevProps.attributes.zoom
			)
		){

			this.displayMap();

		}
	}


	displayMap(){

		let { map } = this.state
		const { lat, lon, popup, zoom } = this.props.attributes

		const realZoom = zoom ? zoom : 13

		if( ! map ){

			map = L.map( this.mapRef.current, {
				center: [ 47.2161494, -1.5335951 ],
				zoom: realZoom
			});
			L.tileLayer('http://{s}.tile.openstreetmap.se/hydda/full/{z}/{x}/{y}.png').addTo( map );


			this.setState( {
				map: map
			} );
		} else {

			// delete every Marker on the map
			map.eachLayer( function ( layer ) {
				if(layer instanceof L.Marker){
					layer.removeFrom( map )
				}
			})

		}


		if( lat && lon ){
			const latLongObj = [ parseFloat( lat ), parseFloat( lon )]

			// Cet the center of the map and the new Marker
			map.setView( latLongObj )
			map.setZoom( realZoom )

			// Add marker
			const marker =L.marker( latLongObj ).addTo( map );

			// Add popup
			if( popup ){
				marker.bindPopup(popup).openPopup();
			}
		}

	}


	changeUserAddress( address ){

		this.props.setAttributes( {
			address: address
		} );
	}

	changePopupContent( content ){

		this.props.setAttributes( {
			popup: content
		} );
	}

	getLatLongFromAddress(){
		const { attributes, setAttributes}  = this.props
		const address = attributes.address

		this.setState({
			isWaitingForNominatim : true
		})
		fetch( 'https://nominatim.openstreetmap.org/search?limit=1&format=json&q=' + encodeURIComponent( address ) )
			.then(function(response) {
				return response.json()
			})
			.then(function( jsonResponse) {

				// set lat long attributes
				if( jsonResponse.length > 0 && jsonResponse[0].lat ){

					setAttributes( {
						lat: jsonResponse[0].lat,
						lon: jsonResponse[0].lon
					} );

					this.setState({
						isWaitingForNominatim : false,
						nominatimReturnEmpty : false
					})
				} else {
					this.setState({
						isWaitingForNominatim : false,
						nominatimReturnEmpty : true
					})
				}

			}.bind( this ))
	}

	render(){
		const { className, attributes, setAttributes } = this.props
		const { isWaitingForNominatim, nominatimReturnEmpty } = this.state

		return(
			<Fragment>
				<InspectorControls>
					<PanelBody title={ __( 'Map Settings' )}>
						<TextControl
							label={ __( 'Address' ) }
							value={ attributes.address }
							onChange={ this.changeUserAddress }
						/>
						<div className="blocks-base-control">
							<Button
								onClick={ this.getLatLongFromAddress }
								isLarge
								isBusy={ isWaitingForNominatim }
							>
								{ attributes.lat ? __('Change marker position') : __('Add marker on map') }
							</Button>
							{ nominatimReturnEmpty && <Notice
								status="error"
								isDismissible={false}
								content={__('Error while searching the address, please verify and try again')}
							/>
							}
						</div>
						{ attributes.lat && <TextareaControl
							label={__('Popup content')}
							value={attributes.popup}
							onChange={this.changePopupContent}
						/>
						}
						<RangeControl
							label={__('Zoom')}
							value={ attributes.zoom ? attributes.zoom : 13 }
							onChange={ ( zoom ) => setAttributes( { zoom: zoom }) }
							min={ 1 }
							max={ 20 }
						/>
					</PanelBody>

				</InspectorControls>
				<div className={className} ref={this.mapRef} style={{ height : '500px'}} />
			</Fragment>
		)
	}
}

export default TiwitSimpleMap;
